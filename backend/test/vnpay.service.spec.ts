/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VnpayService } from '../src/payment/vnpay.service';
import { User, UserPlan } from '../src/entities/user.entity';
import { createHmac } from 'crypto';

describe('VnpayService', () => {
  let service: VnpayService;
  let userRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };

  const mockQueryBuilder = {
    setLock: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    userRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    configService = {
      get: jest.fn((key: string) => {
        const env: Record<string, string> = {
          VNP_URL: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
          VNP_TMNCODE: 'TMN123',
          VNP_HASHSECRET: 'SECRET123',
          VNP_RETURNURL: 'http://localhost:3000/payment/callback',
          VNP_IP_ADDR: '127.0.0.1',
        };
        return env[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VnpayService,
        { provide: ConfigService, useValue: configService },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get<VnpayService>(VnpayService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPaymentUrl', () => {
    it('throws BadRequestException if userId is missing', async () => {
      await expect(service.createPaymentUrl({ userId: '' })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if amount is negative or zero', async () => {
      await expect(service.createPaymentUrl({ userId: 'u-123', amount: 0 })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createPaymentUrl({ userId: 'u-123', amount: -50 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException if user is not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.createPaymentUrl({ userId: 'missing' })).rejects.toThrow(NotFoundException);
    });

    it('creates checkout URL successfully and saves pending state on user', async () => {
      const mockUser = {
        id: 'u-123',
        email: 'test@example.com',
        is_pending_pro: false,
        pending_pro_provider: null,
        pending_pro_order_ref: null,
      } as User;

      userRepo.findOne.mockResolvedValue(mockUser);
      userRepo.save.mockResolvedValue(mockUser);

      const result = await service.createPaymentUrl({ userId: 'u-123', amount: 199000 });

      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 'u-123' } });
      expect(mockUser.is_pending_pro).toBe(true);
      expect(mockUser.pending_pro_provider).toBe('vnpay');
      expect(mockUser.pending_pro_order_ref).toBeDefined();
      expect(userRepo.save).toHaveBeenCalledWith(mockUser);

      expect(result.paymentUrl).toContain('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
      expect(result.paymentUrl).toContain('vnp_SecureHash=');
      expect(result.orderRef).toBe(mockUser.pending_pro_order_ref);
    });

    it('throws InternalServerErrorException if a required environment variable is missing', async () => {
      const mockUser = { id: 'u-123' } as User;
      userRepo.findOne.mockResolvedValue(mockUser);
      configService.get.mockImplementation((key: string) => {
        if (key === 'VNP_URL') return undefined;
        const env: Record<string, string> = {
          VNP_TMNCODE: 'TMN123',
          VNP_HASHSECRET: 'SECRET123',
          VNP_RETURNURL: 'http://localhost:3000/payment/callback',
        };
        return env[key];
      });

      await expect(service.createPaymentUrl({ userId: 'u-123' })).rejects.toThrow(
        'Missing environment variable VNP_URL',
      );
    });
  });

  describe('handleIpn', () => {
    const defaultSecret = 'SECRET123';

    // Helper to generate a valid VNPay query with hash
    function generateVnpayQuery(params: Record<string, string>, secret = defaultSecret) {
      const sortedKeys = Object.keys(params).sort();
      const encodeForVnpay = (value: string) =>
        encodeURIComponent(value)
          .replace(/%20/g, '+')
          .replace(/%[0-9a-f]{2}/gi, (m) => m.toUpperCase());

      const rawHash = sortedKeys.map((key) => `${key}=${encodeForVnpay(params[key])}`).join('&');
      const secureHash = createHmac('sha512', secret).update(rawHash).digest('hex').toUpperCase();

      return {
        ...params,
        vnp_SecureHash: secureHash,
      };
    }

    it('returns RspCode 97 if vnp_SecureHash is missing', async () => {
      const query = { vnp_TxnRef: 'VNP123' };
      const result = await service.handleIpn(query);
      expect(result).toEqual({ RspCode: '97', Message: 'Missing secure hash' });
    });

    it('returns RspCode 97 if secure hash is invalid', async () => {
      const query = { vnp_TxnRef: 'VNP123', vnp_SecureHash: 'WRONGHASH' };
      const result = await service.handleIpn(query);
      expect(result).toEqual({ RspCode: '97', Message: 'Invalid signature' });
    });

    it('returns RspCode 01 if vnp_ResponseCode is not 00', async () => {
      const params = {
        vnp_TxnRef: 'VNP123',
        vnp_ResponseCode: '99',
      };
      const query = generateVnpayQuery(params);
      const result = await service.handleIpn(query);
      expect(result).toEqual({ RspCode: '01', Message: 'Payment failure' });
    });

    it('returns RspCode 04 if required fields are missing', async () => {
      const params = {
        vnp_ResponseCode: '00',
        vnp_TxnRef: 'VNP123',
      };
      // Missing OrderInfo and Amount
      const query = generateVnpayQuery(params);
      const result = await service.handleIpn(query);
      expect(result).toEqual({ RspCode: '04', Message: 'Invalid order data' });
    });

    it('returns RspCode 04 if amount mismatch', async () => {
      const params = {
        vnp_ResponseCode: '00',
        vnp_TxnRef: 'VNP123',
        vnp_OrderInfo: 'PRO_UPGRADE|u-123',
        vnp_Amount: '1000', // expected is defaultProAmountVnd * 100 = 19900000
      };
      const query = generateVnpayQuery(params);
      const result = await service.handleIpn(query);
      expect(result).toEqual({ RspCode: '04', Message: 'Amount mismatch' });
    });

    it('returns RspCode 04 if orderInfo format is invalid', async () => {
      const params = {
        vnp_ResponseCode: '00',
        vnp_TxnRef: 'VNP123',
        vnp_OrderInfo: 'INVALID_FORMAT',
        vnp_Amount: String(199000 * 100),
      };
      const query = generateVnpayQuery(params);
      const result = await service.handleIpn(query);
      expect(result).toEqual({ RspCode: '04', Message: 'Invalid order info' });
    });

    it('returns RspCode 01 if user is not found in DB', async () => {
      const params = {
        vnp_ResponseCode: '00',
        vnp_TxnRef: 'VNP123',
        vnp_OrderInfo: 'PRO_UPGRADE|missing-user',
        vnp_Amount: String(199000 * 100),
      };
      const query = generateVnpayQuery(params);
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.handleIpn(query);
      expect(result).toEqual({ RspCode: '01', Message: 'User not found' });
    });

    it('returns RspCode 01 if user has no matching pending order', async () => {
      const params = {
        vnp_ResponseCode: '00',
        vnp_TxnRef: 'VNP123',
        vnp_OrderInfo: 'PRO_UPGRADE|u-123',
        vnp_Amount: String(199000 * 100),
      };
      const query = generateVnpayQuery(params);
      const mockUser = {
        id: 'u-123',
        pending_pro_provider: 'other', // provider mismatch
        pending_pro_order_ref: 'VNP123',
        is_pending_pro: true,
      } as User;
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      const result = await service.handleIpn(query);
      expect(result).toEqual({ RspCode: '01', Message: 'Order invalid or already processed' });
    });

    it('upgrades user to PRO and returns RspCode 00 on success', async () => {
      const params = {
        vnp_ResponseCode: '00',
        vnp_TxnRef: 'VNP123',
        vnp_OrderInfo: 'PRO_UPGRADE|u-123',
        vnp_Amount: String(199000 * 100),
      };
      const query = generateVnpayQuery(params);
      const mockUser = {
        id: 'u-123',
        email: 'test@example.com',
        plan: UserPlan.FREE,
        credits: 10,
        pending_pro_provider: 'vnpay',
        pending_pro_order_ref: 'VNP123',
        is_pending_pro: true,
      } as User;
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      userRepo.save.mockResolvedValue(mockUser);

      const result = await service.handleIpn(query);

      expect(result).toEqual({ RspCode: '00', Message: 'Confirm success' });
      expect(mockUser.plan).toBe(UserPlan.PRO);
      expect(mockUser.credits).toBe(9999);
      expect(mockUser.is_pending_pro).toBe(false);
      expect(mockUser.pending_pro_provider).toBeNull();
      expect(mockUser.pending_pro_order_ref).toBeNull();
      expect(userRepo.save).toHaveBeenCalledWith(mockUser);
    });

    it('filters out falsy query params in extractVnpayParams', async () => {
      const params = {
        vnp_ResponseCode: '00',
        vnp_TxnRef: 'VNP123',
        vnp_OrderInfo: 'PRO_UPGRADE|u-123',
        vnp_Amount: String(199000 * 100),
      };
      
      const query = {
        ...generateVnpayQuery(params),
        vnp_EmptyParam: '', // append empty param to hit line 195
      };
      
      const mockUser = {
        id: 'u-123',
        pending_pro_provider: 'vnpay',
        pending_pro_order_ref: 'VNP123',
        is_pending_pro: true,
      } as User;
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      const result = await service.handleIpn(query);
      expect(result.RspCode).toBe('00');
    });
  });
});
