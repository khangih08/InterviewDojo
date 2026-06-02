import { Injectable, BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // Thêm DataSource từ typeorm
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { User, UserPlan } from '../entities/user.entity';
import { CreateVnpayUrlDto } from './dto/create-vnpay-url.dto';

export interface VnpayIpnResponse {
  RspCode: string;
  Message: string;
}

@Injectable()
export class VnpayService {
  private readonly logger = new Logger(VnpayService.name);
  private readonly defaultProAmountVnd = 199000; // Giá gói PRO mặc định
  private readonly defaultCurrency = 'VND';

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource, // Inject thêm dâtSource để quản lý Transaction
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Hàm encode chuẩn hóa theo định dạng cổng 2.1.0 của VNPay
  private vnpayUrlEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/%20/g, '+')
      .replace(/%[0-9a-f]{2}/gi, (match) => match.toUpperCase());
  }

  async createPaymentUrl(dto: CreateVnpayUrlDto): Promise<{ paymentUrl: string; orderRef: string }> {
    const { userId, amount = this.defaultProAmountVnd } = dto;

    if (!userId) {
      throw new BadRequestException('Missing userId');
    }
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const orderRef = this.generateSafeTxnRef('VNP', user.id);
    user.is_pending_pro = true;
    user.pending_pro_provider = 'vnpay';
    user.pending_pro_order_ref = orderRef;

    await this.userRepo.save(user);

    const paymentUrl = this.buildVnpayCheckoutUrl(user, orderRef, amount);

    this.logger.log(`Created VNPay payment request orderRef=${orderRef} for user=${user.email}`);

    return { paymentUrl, orderRef };
  }

  private generateSafeTxnRef(prefix: string, userId: string): string {
    const cleanUser = String(userId || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).toUpperCase();
    const ts = Date.now().toString(36).toUpperCase().slice(-6);
    const rand = Math.random().toString(36).replace(/[^a-zA-Z0-9]/g, '').slice(2, 6).toUpperCase();
    const candidate = `${prefix}${cleanUser}${ts}${rand}`.slice(0, 30);
    return candidate;
  }

  async handleIpn(query: Record<string, string | undefined>): Promise<VnpayIpnResponse> {
    return this.handleVnpayCallback(query);
  }

  async handleReturn(query: Record<string, string | undefined>): Promise<VnpayIpnResponse> {
    return this.handleVnpayCallback(query);
  }

  private async handleVnpayCallback(query: Record<string, string | undefined>): Promise<VnpayIpnResponse> {
    const secureHash = query.vnp_SecureHash?.toUpperCase();
    const hashSecret = this.getRequiredEnv('VNP_HASHSECRET');

    if (!secureHash) {
      this.logger.warn('Missing vnp_SecureHash in VNPay callback');
      return { RspCode: '97', Message: 'Missing secure hash' };
    }

    const vnpParams = this.extractVnpayParams(query);
    const computedHash = this.computeSecureHash(vnpParams, hashSecret);
    const rawForDebug = this.computeRawDataForDebug(vnpParams);

    this.logger.debug('VNPay callback hash validation', {
      receivedHash: secureHash,
      computedHash,
      secret: hashSecret.slice(0, 4) + '***',
    });

    if (computedHash !== secureHash) {
      this.logger.warn('Invalid VNPay signature', JSON.stringify({
        received: secureHash,
        computed: computedHash,
        raw: rawForDebug,
      }));
      return { RspCode: '97', Message: 'Invalid signature' };
    }

    if (query.vnp_ResponseCode !== '00') {
      this.logger.warn('VNPay payment response is not success', JSON.stringify(query));
      return { RspCode: '01', Message: 'Payment failure' };
    }

    const orderRef = query.vnp_TxnRef;
    const orderInfo = query.vnp_OrderInfo;
    const rawAmount = query.vnp_Amount;

    if (!orderRef || !orderInfo || !rawAmount) {
      this.logger.warn('VNPay callback missing required fields', JSON.stringify(query));
      return { RspCode: '04', Message: 'Invalid order data' };
    }

    const amount = Number(rawAmount);
    const expectedAmount = this.defaultProAmountVnd * 100;
    if (!Number.isInteger(amount) || amount !== expectedAmount) {
      this.logger.warn('VNPay amount mismatch', JSON.stringify({ amount, expectedAmount }));
      return { RspCode: '04', Message: 'Amount mismatch' };
    }

    const userId = this.parseUserIdFromOrderInfo(orderInfo);
    if (!userId) {
      this.logger.warn('VNPay orderInfo invalid', orderInfo);
      return { RspCode: '04', Message: 'Invalid order info' };
    }

    // Bọc quy trình truy vấn dữ liệu vào Transaction để thực hiện khóa bi quan (Pessimistic Write) an toàn
    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      const user = await transactionalEntityManager
        .createQueryBuilder(User, 'user')
        .setLock('pessimistic_write')
        .where('user.id = :id', { id: userId })
        .getOne();

      if (!user) {
        this.logger.warn('VNPay order user not found', { userId, orderRef });
        return { RspCode: '01', Message: 'User not found' };
      }

      const isSameOrder = user.pending_pro_provider === 'vnpay' && user.pending_pro_order_ref === orderRef;

      if (user.plan === UserPlan.PRO && !user.is_pending_pro) {
        this.logger.log('VNPay callback already processed (idempotent)', { userId, orderRef });
        return { RspCode: '00', Message: 'Confirm success' };
      }

      if (!isSameOrder) {
        this.logger.warn('VNPay duplicate or mismatched order', {
          userId,
          orderRef,
          currentProvider: user.pending_pro_provider,
          currentOrderRef: user.pending_pro_order_ref,
        });
        return { RspCode: '01', Message: 'Order invalid or already processed' };
      }

      // Cập nhật thông tin User lên tài khoản PRO
      user.plan = UserPlan.PRO;
      user.credits = 9999;
      user.is_pending_pro = false;
      user.pending_pro_provider = null;
      user.pending_pro_order_ref = null;

      // Lưu thông qua EntityManager của Transaction hiện tại
      await transactionalEntityManager.save(user);

      this.logger.log(`VNPay confirmed and upgraded user=${user.email} orderRef=${orderRef}`);

      return { RspCode: '00', Message: 'Confirm success' };
    });
  }

  private buildVnpayCheckoutUrl(user: User, orderRef: string, amount: number): string {
    const vnpUrl = this.getRequiredEnv('VNP_URL');
    const vnpTmnCode = this.getRequiredEnv('VNP_TMNCODE');
    const vnpHashSecret = this.getRequiredEnv('VNP_HASHSECRET');
    const vnpReturnUrl = this.getRequiredEnv('VNP_RETURNURL');

    const createDate = this.formatVnpayDate(new Date());
    const orderInfo = `PRO_UPGRADE|${user.id}`;
    const ipAddr = this.configService.get<string>('VNP_IP_ADDR')?.trim() || '127.0.0.1';

    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpTmnCode,
      vnp_Amount: String(amount * 100),
      vnp_CurrCode: this.defaultCurrency,
      vnp_TxnRef: orderRef,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: vnpReturnUrl,
      vnp_CreateDate: createDate,
      vnp_IpAddr: ipAddr,
    };

    const sortedKeys = Object.keys(params).sort();

    const rawHash = sortedKeys
      .map((key) => `${this.vnpayUrlEncode(key)}=${this.vnpayUrlEncode(params[key])}`)
      .join('&');

    const secureHash = createHmac('sha512', vnpHashSecret).update(rawHash).digest('hex').toUpperCase();

    const queryString = sortedKeys
      .map((key) => `${this.vnpayUrlEncode(key)}=${this.vnpayUrlEncode(params[key])}`)
      .join('&');

    return `${vnpUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
  }

  private extractVnpayParams(query: Record<string, string | undefined>): Record<string, string> {
    return Object.entries(query).reduce((acc, [key, value]) => {
      if (!value) {
        return acc;
      }
      if (key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
  }

  private computeSecureHash(params: Record<string, string>, secret: string): string {
    const sortedKeys = Object.keys(params).sort();
    
    const rawData = sortedKeys
      .map((key) => `${key}=${this.vnpayUrlEncode(params[key])}`)
      .join('&');
    
    return createHmac('sha512', secret).update(rawData).digest('hex').toUpperCase();
  }

  private computeRawDataForDebug(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).sort();
    return sortedKeys
      .map((key) => `${key}=${this.vnpayUrlEncode(params[key])}`)
      .join('&');
  }

  private parseUserIdFromOrderInfo(orderInfo: string): string | null {
    const parts = orderInfo.split('|');
    if (parts.length !== 2) {
      return null;
    }
    return parts[1] || null;
  }

  private formatVnpayDate(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }

  private getRequiredEnv(key: string): string {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) {
      throw new InternalServerErrorException(`Missing environment variable ${key}`);
    }
    return value;
  }
}