import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { VnpayController } from '../payment/vnpay.controller';
import { VnpayService } from '../payment/vnpay.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User])],
  controllers: [VnpayController],
  providers: [VnpayService],
  exports: [VnpayService],
})
export class PaymentModule {}
