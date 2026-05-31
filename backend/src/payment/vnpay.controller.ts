import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { CreateVnpayUrlDto } from './dto/create-vnpay-url.dto';
import { VnpayIpnResponse } from './vnpay.service';

@Controller('payment/vnpay')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  /**
   * Tạo link thanh toán VNPay.
   * Frontend sẽ redirect người dùng sang URL này.
   */
  @Post('create-url')
  async createVnpayUrl(@Body() body: CreateVnpayUrlDto) {
    if (!body?.userId) {
      throw new BadRequestException('Missing userId');
    }
    return await this.vnpayService.createPaymentUrl(body);
  }

  /**
   * Callback / IPN endpoint nhận dữ liệu VNPay gửi về sau khi người dùng hoàn tất thanh toán.
   */
  @Get('ipn')
  async handleIpn(@Query() query: Record<string, string | undefined>): Promise<VnpayIpnResponse> {
    return await this.vnpayService.handleIpn(query);
  }
}
