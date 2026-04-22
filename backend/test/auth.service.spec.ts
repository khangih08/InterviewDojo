/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { SessionsService } from '../src/auth/sessions.service';
import { User } from '../src/entities/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn().mockResolvedValue({}),
    })),
  },
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({}),
  })),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let jwtService: { signAsync: jest.Mock };
  let configService: { get: jest.Mock };
  let sessionsService: { createSession: jest.Mock; revokeSession: jest.Mock };

  const baseUser = {
    id: 'u-1',
    email: 'test@example.com',
    password: 'hashed-pw',
    full_name: 'Test User',
    target_role: 'Frontend Developer',
    experience_level: 'junior',
    role: 'user',
    is_google_user: false,
    google_verified: false,
    refreshToken: null,
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('jwt-token') };
    configService = { get: jest.fn().mockReturnValue(null) };
    sessionsService = {
      createSession: jest.fn().mockResolvedValue({}),
      revokeSession: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: SessionsService, useValue: sessionsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const dto = {
      email: 'new@example.com',
      password: 'Pass#1abc',
      full_name: 'New User',
      target_role: 'Frontend Developer' as any,
      experience_level: 'junior' as any,
    };

    it('throws ConflictException when email already exists', async () => {
      userRepo.findOne.mockResolvedValue(baseUser);
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('registers user and returns tokens with session', async () => {
      userRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      userRepo.create.mockReturnValue({ ...baseUser, id: 'new-id' });
      userRepo.save.mockResolvedValue({ ...baseUser, id: 'new-id' });
      userRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.register(dto, 'ua', '127.0.0.1');

      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.email).toBe(baseUser.email);
      expect(sessionsService.createSession).toHaveBeenCalled();
    });

    it('throws ConflictException when save fails', async () => {
      userRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      userRepo.create.mockReturnValue({});
      userRepo.save.mockRejectedValue(new Error('DB error'));

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nobody@x.com', password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      userRepo.findOne.mockResolvedValue(baseUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens on valid credentials', async () => {
      userRepo.findOne.mockResolvedValue(baseUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.login({
        email: 'test@example.com',
        password: 'correct',
      });

      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.email).toBe(baseUser.email);
      expect(sessionsService.createSession).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('throws UnauthorizedException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.refreshToken('unknown')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns new tokens for valid user', async () => {
      userRepo.findOne.mockResolvedValue(baseUser);
      userRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.refreshToken('u-1');
      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.id).toBe(baseUser.id);
    });
  });

  describe('logout', () => {
    it('clears refresh token without session revocation when no sessionId', async () => {
      userRepo.update.mockResolvedValue({ affected: 1 });
      await service.logout('u-1');
      expect(userRepo.update).toHaveBeenCalledWith('u-1', {
        refreshToken: null,
      });
      expect(sessionsService.revokeSession).not.toHaveBeenCalled();
    });

    it('revokes specific session when sessionId is provided', async () => {
      userRepo.update.mockResolvedValue({ affected: 1 });
      await service.logout('u-1', 'sess-1');
      expect(sessionsService.revokeSession).toHaveBeenCalledWith(
        'sess-1',
        'u-1',
      );
    });
  });

  describe('forgotPassword', () => {
    it('returns generic message even for non-existent email', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const result = await service.forgotPassword('nobody@example.com');
      expect(result.message).toContain('Verification code sent');
    });

    it('saves reset code for existing user', async () => {
      userRepo.findOne.mockResolvedValue({ ...baseUser });
      userRepo.save.mockResolvedValue({});

      const result = await service.forgotPassword('test@example.com');
      expect(userRepo.save).toHaveBeenCalled();
      expect(result.message).toContain('expires in 1 minute');
    });
  });

  describe('verifyResetCode', () => {
    const validUser = {
      ...baseUser,
      password_reset_code: '5678',
      password_reset_expires_at: new Date(Date.now() + 60_000),
    };

    it('throws UnauthorizedException for wrong code', async () => {
      userRepo.findOne.mockResolvedValue(validUser);
      await expect(
        service.verifyResetCode({ email: 'test@example.com', code: '0000' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for expired code', async () => {
      userRepo.findOne.mockResolvedValue({
        ...baseUser,
        password_reset_code: '5678',
        password_reset_expires_at: new Date(Date.now() - 1000),
      });
      await expect(
        service.verifyResetCode({ email: 'test@example.com', code: '5678' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.verifyResetCode({ email: 'test@example.com', code: '1234' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns success for valid code within expiry', async () => {
      userRepo.findOne.mockResolvedValue(validUser);
      const result = await service.verifyResetCode({
        email: 'test@example.com',
        code: '5678',
      });
      expect(result.message).toContain('confirmed');
    });
  });

  describe('resetPassword', () => {
    const validUser = {
      ...baseUser,
      password_reset_code: '9999',
      password_reset_expires_at: new Date(Date.now() + 60_000),
    };

    it('throws UnauthorizedException for wrong code', async () => {
      userRepo.findOne.mockResolvedValue(validUser);
      await expect(
        service.resetPassword({
          email: 'test@example.com',
          code: 'bad',
          password: 'Pass#1abc',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws BadRequestException for weak password', async () => {
      userRepo.findOne.mockResolvedValue(validUser);
      await expect(
        service.resetPassword({
          email: 'test@example.com',
          code: '9999',
          password: 'weak',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('updates password and clears reset code on success', async () => {
      userRepo.findOne.mockResolvedValue({ ...validUser });
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      userRepo.save.mockResolvedValue({});

      const result = await service.resetPassword({
        email: 'test@example.com',
        code: '9999',
        password: 'NewPass#123',
      });

      expect(result.message).toContain('Password successfully updated');
      expect(userRepo.save).toHaveBeenCalled();
    });
  });

  describe('completeGoogleProfile', () => {
    const profileDto = {
      full_name: 'Updated Name',
      target_role: 'Backend Developer' as any,
      experience_level: 'junior' as any,
    };

    it('throws UnauthorizedException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.completeGoogleProfile('u-1', profileDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws BadRequestException for non-Google user', async () => {
      userRepo.findOne.mockResolvedValue({
        ...baseUser,
        is_google_user: false,
      });
      await expect(
        service.completeGoogleProfile('u-1', profileDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('updates profile for Google user and returns success', async () => {
      userRepo.findOne.mockResolvedValue({
        ...baseUser,
        is_google_user: true,
      });
      userRepo.save.mockResolvedValue({});

      const result = await service.completeGoogleProfile('u-1', profileDto);
      expect(result.message).toContain('completed successfully');
    });
  });

  describe('googleRegisterVerify', () => {
    it('throws UnauthorizedException for wrong verification code', async () => {
      userRepo.findOne.mockResolvedValue({
        ...baseUser,
        is_google_user: true,
        google_verification_code: '1111',
      });
      await expect(
        service.googleRegisterVerify({
          email: 'test@example.com',
          code: '9999',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.googleRegisterVerify({
          email: 'test@example.com',
          code: '1234',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('marks user as verified and returns tokens', async () => {
      userRepo.findOne.mockResolvedValue({
        ...baseUser,
        is_google_user: true,
        google_verified: false,
        google_verification_code: '2222',
      });
      userRepo.save.mockResolvedValue({});
      userRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.googleRegisterVerify({
        email: 'test@example.com',
        code: '2222',
      });
      expect(result.accessToken).toBe('jwt-token');
    });
  });

  describe('googleLogin', () => {
    const googleTokenPayload = {
      email: 'google@test.com',
      name: 'Google User',
      email_verified: 'true',
      aud: null,
    };

    function mockValidFetch(overrides: Record<string, unknown> = {}) {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ ...googleTokenPayload, ...overrides }),
      } as unknown as Response);
    }

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('creates a new user and sets requiresProfileCompletion=true', async () => {
      mockValidFetch();
      userRepo.findOne.mockResolvedValue(null);
      userRepo.create.mockReturnValue({ ...baseUser, email: 'google@test.com' });
      userRepo.save.mockResolvedValue({ ...baseUser, email: 'google@test.com' });
      userRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.googleLogin({ idToken: 'gid-token' });

      expect(result.requiresProfileCompletion).toBe(true);
      expect(userRepo.create).toHaveBeenCalled();
      expect(sessionsService.createSession).toHaveBeenCalled();
    });

    it('throws InternalServerErrorException when new user save fails', async () => {
      mockValidFetch();
      userRepo.findOne.mockResolvedValue(null);
      userRepo.create.mockReturnValue({});
      userRepo.save.mockRejectedValue(new Error('DB error'));

      await expect(
        service.googleLogin({ idToken: 'gid-token' }),
      ).rejects.toThrow('Failed to create user account');
    });

    it('returns existing user without requiresProfileCompletion', async () => {
      mockValidFetch();
      const existingUser = { ...baseUser, is_google_user: true, google_verified: true };
      userRepo.findOne.mockResolvedValue(existingUser);
      userRepo.save.mockResolvedValue(existingUser);
      userRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.googleLogin({ idToken: 'gid-token' });

      expect(result.requiresProfileCompletion).toBeFalsy();
    });

    it('updates full_name when it differs from the Google profile', async () => {
      mockValidFetch({ name: 'New Name' });
      const existingUser = { ...baseUser, full_name: 'Old Name', is_google_user: true };
      userRepo.findOne.mockResolvedValue(existingUser);
      userRepo.save.mockResolvedValue({ ...existingUser, full_name: 'New Name' });
      userRepo.update.mockResolvedValue({ affected: 1 });

      await service.googleLogin({ idToken: 'gid-token' });

      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ full_name: 'New Name' }),
      );
    });

    it('sets is_google_user=true for existing users who do not have it', async () => {
      mockValidFetch();
      const existingUser = { ...baseUser, is_google_user: false, google_verified: true };
      userRepo.findOne.mockResolvedValue(existingUser);
      userRepo.save.mockResolvedValue({ ...existingUser, is_google_user: true });
      userRepo.update.mockResolvedValue({ affected: 1 });

      await service.googleLogin({ idToken: 'gid-token' });

      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_google_user: true }),
      );
    });

    it('sets google_verified=true for existing users who do not have it', async () => {
      mockValidFetch();
      const existingUser = { ...baseUser, is_google_user: true, google_verified: false };
      userRepo.findOne.mockResolvedValue(existingUser);
      userRepo.save.mockResolvedValue({ ...existingUser, google_verified: true });
      userRepo.update.mockResolvedValue({ affected: 1 });

      await service.googleLogin({ idToken: 'gid-token' });

      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ google_verified: true }),
      );
    });

    it('throws UnauthorizedException when Google token verification fails', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
      } as unknown as Response);

      await expect(
        service.googleLogin({ idToken: 'bad-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when Google email is not verified', async () => {
      mockValidFetch({ email_verified: false });

      await expect(
        service.googleLogin({ idToken: 'gid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when token is missing email', async () => {
      mockValidFetch({ email: undefined });

      await expect(
        service.googleLogin({ idToken: 'gid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when token aud does not match configured client ID', async () => {
      configService.get.mockReturnValue('expected-client-id');
      mockValidFetch({ aud: 'wrong-client-id' });

      await expect(
        service.googleLogin({ idToken: 'gid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('googleRegisterStart', () => {
    const dto = {
      idToken: 'gid-token',
      target_role: 'Frontend Developer',
      experience_level: 'junior',
    };

    const googleTokenPayload = {
      email: 'newgoogle@test.com',
      name: 'New Google User',
      email_verified: 'true',
      aud: null,
    };

    beforeEach(() => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(googleTokenPayload),
      } as unknown as Response);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('throws ConflictException when user already exists', async () => {
      userRepo.findOne.mockResolvedValue(baseUser);

      await expect(service.googleRegisterStart(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates user, sends verification email, and returns email + full_name', async () => {
      userRepo.findOne.mockResolvedValue(null);
      userRepo.create.mockReturnValue({ email: 'newgoogle@test.com' });
      userRepo.save.mockResolvedValue({ email: 'newgoogle@test.com' });

      const result = await service.googleRegisterStart(dto);

      expect(userRepo.save).toHaveBeenCalled();
      expect(result.email).toBe('newgoogle@test.com');
      expect(result.full_name).toBe('New Google User');
      expect(result.message).toContain('Verification code sent');
    });
  });

  describe('sendVerificationEmail (SMTP configured path)', () => {
    beforeEach(() => {
      configService.get.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          SMTP_HOST: 'smtp.test.com',
          SMTP_PORT: '587',
          SMTP_USERNAME: 'user@test.com',
          SMTP_PASSWORD: 'secret',
          SMTP_SECURE: 'false',
          SMTP_FROM: 'noreply@test.com',
        };
        return map[key] ?? null;
      });
    });

    it('sends email via nodemailer when SMTP is configured', async () => {
      userRepo.findOne.mockResolvedValue({ ...baseUser });
      userRepo.save.mockResolvedValue({});

      await expect(
        service.forgotPassword('test@example.com'),
      ).resolves.not.toThrow();
    });

    it('throws InternalServerErrorException when sendMail fails', async () => {
      const nodemailer = await import('nodemailer');
      (nodemailer.default.createTransport as jest.Mock).mockReturnValueOnce({
        sendMail: jest.fn().mockRejectedValue(new Error('SMTP connection failed')),
      });

      userRepo.findOne.mockResolvedValue({ ...baseUser });
      userRepo.save.mockResolvedValue({});

      await expect(
        service.forgotPassword('test@example.com'),
      ).rejects.toThrow('Unable to send verification email');
    });
  });
});
