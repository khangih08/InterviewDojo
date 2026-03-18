import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto, LoginDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return {
      message: 'Registration feature will be handled here',
      receivedData: body
    };
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return {
      message: 'Login feature will be handled here',
      receivedData: body
    };
  }
}
