import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ExperienceLevel, JobRole, RegisterDto } from './dto/register.dto';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { CompleteGoogleProfileDto } from './dto/complete-google-profile.dto';
import { SessionsService } from './sessions.service';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private sessionsService: SessionsService,
  ) {}

  async register(
    registerDto: RegisterDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const { email, password, full_name, target_role, experience_level } =
      registerDto;
    // Check if user already exists
    const existingUser = await this.UserRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
      const userInstance = this.UserRepository.create({
        email,
        password: hashedPassword,
        full_name,
        target_role,
        experience_level,
      });
      const user = await this.UserRepository.save(userInstance);
      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.updateRefreshToken(user.id, tokens.refreshToken);
      // Create session
      await this.sessionsService.createSession(
        user.id,
        tokens.refreshToken,
        userAgent,
        ipAddress,
      );
      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          target_role: user.target_role,
          experience_level: user.experience_level,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Error during user registration:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new ConflictException('Error creating user: ' + errorMessage);
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email, role };
    const refreshId = randomBytes(16).toString('hex');
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync({ ...payload, refreshId }, { expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }

  //Update refresh token in database
  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.UserRepository.update(userId, { refreshToken });
  }

  async refreshToken(userId: string): Promise<AuthResponseDto> {
    const user = await this.UserRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        target_role: true,
        experience_level: true,
        role: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        target_role: user.target_role,
        experience_level: user.experience_level,
        role: user.role,
      },
    };
  }

  // Log out
  async logout(userId: string, sessionId?: string): Promise<void> {
    await this.UserRepository.update(userId, { refreshToken: null });
    // If we have a session ID, revoke that specific session
    if (sessionId) {
      await this.sessionsService.revokeSession(sessionId, userId);
    }
  }

  async login(
    loginDto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const { email, password } = loginDto;
    const user = await this.UserRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'full_name',
        'role',
        'target_role',
        'experience_level',
      ],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password ');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    // Create session
    await this.sessionsService.createSession(
      user.id,
      tokens.refreshToken,
      userAgent,
      ipAddress,
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        target_role: user.target_role,
        experience_level: user.experience_level,
        role: user.role,
      },
    };
  }

  async googleLogin(
    googleLoginDto: {
      idToken: string;
    },
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const googleUser = await this.verifyGoogleIdToken(googleLoginDto.idToken);
    console.log('[GoogleLogin] Verified user:', googleUser.email);
    let isNewGoogleUser = false;

    let user = await this.UserRepository.findOne({
      where: { email: googleUser.email },
    });

    console.log('[GoogleLogin] Found user:', user ? user.email : 'NOT FOUND');

    if (!user) {
      console.log('[GoogleLogin] Creating new user for:', googleUser.email);
      isNewGoogleUser = true;
      try {
        const userInstance = this.UserRepository.create({
          email: googleUser.email,
          password: '',
          full_name: googleUser.full_name,
          target_role: JobRole.FRONTEND,
          experience_level: ExperienceLevel.FRESHER,
          is_google_user: true,
          google_verified: true,
          google_verification_code: null,
        } as Partial<User>);

        user = await this.UserRepository.save(userInstance);
        console.log('[GoogleLogin] New user created:', user.id);
      } catch (error) {
        console.error('[GoogleLogin] Error creating user:', error);
        throw new InternalServerErrorException('Failed to create user account');
      }
    } else {
      console.log('[GoogleLogin] Updating existing user:', user.email);
      if (user.full_name !== googleUser.full_name) {
        user.full_name = googleUser.full_name;
      }

      if (!user.is_google_user) {
        user.is_google_user = true;
      }

      if (!user.google_verified) {
        user.google_verified = true;
      }

      await this.UserRepository.save(user);
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    // Create session
    await this.sessionsService.createSession(
      user.id,
      tokens.refreshToken,
      userAgent,
      ipAddress,
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        target_role: user.target_role,
        experience_level: user.experience_level,
        role: user.role,
      },
      requiresProfileCompletion: isNewGoogleUser,
    };
  }

  async completeGoogleProfile(
    userId: string,
    completeGoogleProfileDto: CompleteGoogleProfileDto,
  ): Promise<{
    message: string;
    user: {
      id: string;
      email: string;
      full_name: string;
      target_role: JobRole;
      experience_level: ExperienceLevel;
      role: string;
    };
  }> {
    const user = await this.UserRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        target_role: true,
        experience_level: true,
        role: true,
        is_google_user: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.is_google_user) {
      throw new BadRequestException('This endpoint is only for Google users');
    }

    user.full_name = completeGoogleProfileDto.full_name;
    user.target_role = completeGoogleProfileDto.target_role as JobRole;
    user.experience_level =
      completeGoogleProfileDto.experience_level as ExperienceLevel;

    await this.UserRepository.save(user);

    return {
      message: 'Google profile completed successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        target_role: user.target_role,
        experience_level: user.experience_level,
        role: user.role,
      },
    };
  }

  private generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000)
      .toString()
      .padStart(4, '0');
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.UserRepository.findOne({
      where: { email },
      select: ['id', 'email'],
    });

    if (!user) {
      return {
        message:
          'Verification code sent to your email if the address exists in our system.',
      };
    }

    const code = this.generateVerificationCode();
    user.password_reset_code = code;
    user.password_reset_expires_at = new Date(Date.now() + 60_000);
    await this.UserRepository.save(user);
    await this.sendVerificationEmail(email, code);

    return {
      message: 'Verification code sent to your email. It expires in 1 minute.',
    };
  }

  async verifyResetCode(verifyDto: {
    email: string;
    code: string;
  }): Promise<{ message: string }> {
    const user = await this.UserRepository.findOne({
      where: { email: verifyDto.email },
      select: ['id', 'password_reset_code', 'password_reset_expires_at'],
    });

    if (
      !user ||
      !user.password_reset_code ||
      user.password_reset_code !== verifyDto.code ||
      !user.password_reset_expires_at ||
      user.password_reset_expires_at.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    return {
      message: 'Verification code confirmed. You may now reset your password.',
    };
  }

  async resetPassword(resetDto: {
    email: string;
    code: string;
    password: string;
  }): Promise<{ message: string }> {
    const user = await this.UserRepository.findOne({
      where: { email: resetDto.email },
      select: [
        'id',
        'password',
        'password_reset_code',
        'password_reset_expires_at',
      ],
    });

    if (
      !user ||
      !user.password_reset_code ||
      user.password_reset_code !== resetDto.code ||
      !user.password_reset_expires_at ||
      user.password_reset_expires_at.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    if (!this.isValidPassword(resetDto.password)) {
      throw new BadRequestException(
        'Password does not meet complexity requirements',
      );
    }

    user.password = await bcrypt.hash(resetDto.password, this.SALT_ROUNDS);
    user.password_reset_code = null;
    user.password_reset_expires_at = null;
    await this.UserRepository.save(user);

    return {
      message:
        'Password successfully updated. You can now sign in with your new password.',
    };
  }

  private isValidPassword(password: string): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,32}$/.test(
      password,
    );
  }

  async googleRegisterStart(googleRegisterStartDto: {
    idToken: string;
    target_role: string;
    experience_level: string;
  }) {
    const googleUser = await this.verifyGoogleIdToken(
      googleRegisterStartDto.idToken,
    );

    const existingUser = await this.UserRepository.findOne({
      where: { email: googleUser.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9000)
      .toString()
      .padStart(4, '0');

    const userInstance = this.UserRepository.create({
      email: googleUser.email,
      password: '',
      full_name: googleUser.full_name,
      target_role: googleRegisterStartDto.target_role as JobRole,
      experience_level:
        googleRegisterStartDto.experience_level as ExperienceLevel,
      is_google_user: true,
      google_verified: false,
      google_verification_code: verificationCode,
    } as Partial<User>);

    await this.UserRepository.save(userInstance);
    await this.sendVerificationEmail(googleUser.email, verificationCode);

    return {
      message: 'Verification code sent to your Gmail address.',
      email: googleUser.email,
      full_name: googleUser.full_name,
    };
  }

  async googleRegisterVerify(googleRegisterVerifyDto: {
    email: string;
    code: string;
  }): Promise<AuthResponseDto> {
    const user = await this.UserRepository.findOne({
      where: { email: googleRegisterVerifyDto.email, is_google_user: true },
      select: [
        'id',
        'email',
        'full_name',
        'role',
        'target_role',
        'experience_level',
        'google_verified',
        'google_verification_code',
      ],
    });

    if (
      !user ||
      user.google_verification_code !== googleRegisterVerifyDto.code
    ) {
      throw new UnauthorizedException('Invalid verification code');
    }

    user.google_verified = true;
    user.google_verification_code = null;
    await this.UserRepository.save(user);

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        target_role: user.target_role,
        experience_level: user.experience_level,
        role: user.role,
      },
    };
  }

  private async verifyGoogleIdToken(idToken: string) {
    const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
      idToken,
    )}`;

    const response = await fetch(tokenInfoUrl);
    if (!response.ok) {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    const data = (await response.json()) as {
      email?: string;
      email_verified?: string | boolean;
      name?: string;
      aud?: string;
    };

    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (googleClientId && data.aud !== googleClientId) {
      throw new UnauthorizedException('Invalid Google client ID');
    }

    if (!data.email || !data.name) {
      throw new UnauthorizedException(
        'Google token is missing required profile information',
      );
    }

    const emailVerified =
      data.email_verified === 'true' || data.email_verified === true;
    if (!emailVerified) {
      throw new UnauthorizedException('Google email address is not verified');
    }

    return {
      email: data.email,
      full_name: data.name,
    };
  }

  private async sendVerificationEmail(
    email: string,
    code: string,
  ): Promise<void> {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT', '587'));
    const user = this.configService.get<string>('SMTP_USERNAME');
    const pass = this.configService.get<string>('SMTP_PASSWORD');
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';
    const from =
      this.configService.get<string>('SMTP_FROM') ||
      `Interview Dojo <no-reply@${host ?? 'example.com'}>`;

    if (!host || !user || !pass) {
      console.log(
        `[Google OTP] ${email} code=${code} (SMTP not configured, falling back to console output)`,
      );
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });

      await transporter.sendMail({
        from,
        to: email,
        subject: 'InterviewDojo verification code',
        text: `Your 4-digit verification code is ${code}`,
        html: `<p>Your 4-digit verification code is <strong>${code}</strong></p>`,
      });
    } catch (error) {
      console.error('Failed to send verification email', error);
      throw new InternalServerErrorException(
        'Unable to send verification email. Please try again later.',
      );
    }
  }
}
