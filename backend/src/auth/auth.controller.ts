import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import {
  GoogleLoginDto,
  GoogleRegisterStartDto,
  GoogleRegisterVerifyDto,
} from './dto/google-auth.dto';
import { CompleteGoogleProfileDto } from './dto/complete-google-profile.dto';
import {
  ForgotPasswordRequestDto,
  ForgotPasswordResetDto,
  ForgotPasswordVerifyDto,
} from './dto/forgot-password.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { LoginDto } from './dto/login.dto';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Extract user agent and IP address from request
   */
  private getClientInfo(req: Request): {
    userAgent?: string;
    ipAddress?: string;
  } {
    const userAgent = req.get('user-agent');
    const ipAddress =
      (req.get('x-forwarded-for') as string)?.split(',')[0] ||
      req.ip ||
      req.socket.remoteAddress;
    return { userAgent, ipAddress };
  }

  // Register api
  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed or user already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const { userAgent, ipAddress } = this.getClientInfo(req);
    return await this.authService.register(registerDto, userAgent, ipAddress);
  }

  // Refresh access token
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth('JWT-refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates a new access token using a valid refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'New access token generated successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or expired refresh token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  async refresh(@GetUser('id') userId: string): Promise<AuthResponseDto> {
    return await this.authService.refreshToken(userId);
  }

  // Logout user and invalidate refresh token
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Logs out the user and invalidates the refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or expired access token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  async logout(@GetUser('id') userId: string): Promise<{ message: string }> {
    await this.authService.logout(userId);
    return { message: 'Logged out successfully' };
  }

  //Login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user and returns access and refresh tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid credentials',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const { userAgent, ipAddress } = this.getClientInfo(req);
    return await this.authService.login(loginDto, userAgent, ipAddress);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordRequestDto,
  ): Promise<{ message: string }> {
    return await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('forgot-password/verify')
  @HttpCode(HttpStatus.OK)
  async verifyForgotPasswordCode(
    @Body() forgotPasswordVerifyDto: ForgotPasswordVerifyDto,
  ): Promise<{ message: string }> {
    return await this.authService.verifyResetCode(forgotPasswordVerifyDto);
  }

  @Post('forgot-password/reset')
  @HttpCode(HttpStatus.OK)
  async resetForgotPassword(
    @Body() forgotPasswordResetDto: ForgotPasswordResetDto,
  ): Promise<{ message: string }> {
    return await this.authService.resetPassword(forgotPasswordResetDto);
  }

  @Post('google/login')
  @HttpCode(HttpStatus.OK)
  async googleLogin(
    @Body() googleLoginDto: GoogleLoginDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const { userAgent, ipAddress } = this.getClientInfo(req);
    return await this.authService.googleLogin(
      googleLoginDto,
      userAgent,
      ipAddress,
    );
  }

  @Post('google/register')
  @HttpCode(HttpStatus.OK)
  async googleRegisterStart(
    @Body() googleRegisterStartDto: GoogleRegisterStartDto,
  ) {
    return await this.authService.googleRegisterStart(googleRegisterStartDto);
  }

  @Post('google/register/verify')
  @HttpCode(HttpStatus.OK)
  async googleRegisterVerify(
    @Body() googleRegisterVerifyDto: GoogleRegisterVerifyDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.googleRegisterVerify(googleRegisterVerifyDto);
  }

  @Post('google/complete-profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async completeGoogleProfile(
    @GetUser('id') userId: string,
    @Body() completeGoogleProfileDto: CompleteGoogleProfileDto,
  ): Promise<{
    message: string;
    user: {
      id: string;
      email: string;
      full_name: string;
      target_role: string;
      experience_level: string;
      role: string;
    };
  }> {
    return await this.authService.completeGoogleProfile(
      userId,
      completeGoogleProfileDto,
    );
  }
}
