/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { VnpayController } from '../src/payment/vnpay.controller';
import { VnpayService } from '../src/payment/vnpay.service';

const mockVnpayService = {
  createPaymentUrl: jest.fn(),
  handleIpn: jest.fn(),
};

describe('VnpayController', () => {
  let controller: VnpayController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VnpayController],
      providers: [
        { provide: VnpayService, useValue: mockVnpayService },
      ],
    }).compile();

    controller = module.get<VnpayController>(VnpayController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createVnpayUrl', () => {
    it('throws BadRequestException if body or userId is missing', async () => {
      await expect(controller.createVnpayUrl(null as any)).rejects.toThrow(BadRequestException);
      await expect(controller.createVnpayUrl({ userId: '' })).rejects.toThrow(BadRequestException);
    });

    it('delegates to vnpayService.createPaymentUrl on success', async () => {
      const response = { paymentUrl: 'https://vnpay.vn/pay', orderRef: 'VNP123' };
      mockVnpayService.createPaymentUrl.mockResolvedValue(response);

      const result = await controller.createVnpayUrl({ userId: 'u-123', amount: 199000 });

      expect(mockVnpayService.createPaymentUrl).toHaveBeenCalledWith({ userId: 'u-123', amount: 199000 });
      expect(result).toEqual(response);
    });
  });

  describe('handleIpn', () => {
    it('delegates to vnpayService.handleIpn', async () => {
      const ipnResponse = { RspCode: '00', Message: 'Confirm success' };
      mockVnpayService.handleIpn.mockResolvedValue(ipnResponse);

      const query = { vnp_TxnRef: 'VNP123', vnp_ResponseCode: '00' };
      const result = await controller.handleIpn(query);

      expect(mockVnpayService.handleIpn).toHaveBeenCalledWith(query);
      expect(result).toEqual(ipnResponse);
    });
  });
});
