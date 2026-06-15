import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { VnpayService } from '../payment/vnpay.service';
import { CreateVnpayUrlDto } from './dto/create-vnpay-url.dto';
import { VnpayIpnResponse } from '../payment/vnpay.service';

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
   * Callback / return endpoint nhận dữ liệu VNPay khi người dùng được chuyển về trang chủ site.
   */
  @Get('return')
  async handleReturn(@Query() query: Record<string, string | undefined>): Promise<VnpayIpnResponse> {
    return await this.vnpayService.handleReturn(query);
  }

  /**
   * IPN endpoint nhận dữ liệu VNPay server-to-server để đồng bộ thanh toán.
   */
  @Get('ipn')
  async handleIpn(@Query() query: Record<string, string | undefined>): Promise<VnpayIpnResponse> {
    return await this.vnpayService.handleIpn(query);
  }
}
