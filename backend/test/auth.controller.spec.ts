/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  verifyResetCode: jest.fn(),
  resetPassword: jest.fn(),
  googleLogin: jest.fn(),
  googleRegisterStart: jest.fn(),
  googleRegisterVerify: jest.fn(),
  completeGoogleProfile: jest.fn(),
};

const mockRequest = {
  get: jest.fn().mockReturnValue('Mozilla/5.0 (Windows) Chrome/120'),
  ip: '127.0.0.1',
  socket: { remoteAddress: '127.0.0.1' },
} as any;

const authResponse = {
  accessToken: 'access-tok',
  refreshToken: 'refresh-tok',
  user: {
    id: 'u-1',
    email: 'test@example.com',
    full_name: 'Test User',
    target_role: 'Frontend Developer',
    experience_level: 'junior',
    role: 'user',
  },
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('delegates to authService.register with client info', async () => {
      mockAuthService.register.mockResolvedValue(authResponse);

      const dto = {
        email: 'a@b.com',
        password: 'P#1abc',
        full_name: 'A',
        target_role: 'Frontend Developer',
        experience_level: 'junior',
      } as any;

      await controller.register(dto, mockRequest);

      expect(mockAuthService.register).toHaveBeenCalledWith(
        dto,
        expect.any(String),
        expect.any(String),
      );
    });

    it('returns the response from authService', async () => {
      mockAuthService.register.mockResolvedValue(authResponse);
      const result = await controller.register({} as any, mockRequest);
      expect(result).toEqual(authResponse);
    });
  });

  describe('login', () => {
    it('delegates to authService.login with client info', async () => {
      mockAuthService.login.mockResolvedValue(authResponse);

      await controller.login({ email: 'a@b.com', password: 'pw' }, mockRequest);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        { email: 'a@b.com', password: 'pw' },
        expect.any(String),
        expect.any(String),
      );
    });
  });

  describe('refresh', () => {
    it('delegates to authService.refreshToken with userId', async () => {
      mockAuthService.refreshToken.mockResolvedValue(authResponse);

      await controller.refresh('u-1');

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('u-1');
    });
  });

  describe('logout', () => {
    it('calls authService.logout and returns success message', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout('u-1');

      expect(mockAuthService.logout).toHaveBeenCalledWith('u-1');
      expect(result.message).toContain('Logged out');
    });
  });

  describe('forgotPassword', () => {
    it('delegates to authService.forgotPassword with email', async () => {
      mockAuthService.forgotPassword.mockResolvedValue({ message: 'sent' });

      await controller.forgotPassword({ email: 'a@b.com' });

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('a@b.com');
    });
  });

  describe('verifyForgotPasswordCode', () => {
    it('delegates to authService.verifyResetCode', async () => {
      mockAuthService.verifyResetCode.mockResolvedValue({ message: 'ok' });

      await controller.verifyForgotPasswordCode({
        email: 'a@b.com',
        code: '1234',
      });

      expect(mockAuthService.verifyResetCode).toHaveBeenCalledWith({
        email: 'a@b.com',
        code: '1234',
      });
    });
  });

  describe('resetForgotPassword', () => {
    it('delegates to authService.resetPassword', async () => {
      mockAuthService.resetPassword.mockResolvedValue({ message: 'reset' });

      await controller.resetForgotPassword({
        email: 'a@b.com',
        code: '1234',
        password: 'NewP#1',
      });

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith({
        email: 'a@b.com',
        code: '1234',
        password: 'NewP#1',
      });
    });
  });

  describe('googleLogin', () => {
    it('delegates to authService.googleLogin with client info', async () => {
      mockAuthService.googleLogin.mockResolvedValue(authResponse);

      await controller.googleLogin({ idToken: 'google-id-token' }, mockRequest);

      expect(mockAuthService.googleLogin).toHaveBeenCalledWith(
        { idToken: 'google-id-token' },
        expect.any(String),
        expect.any(String),
      );
    });
  });

  describe('googleRegisterStart', () => {
    it('delegates to authService.googleRegisterStart', async () => {
      mockAuthService.googleRegisterStart.mockResolvedValue({
        message: 'code sent',
        email: 'a@b.com',
        full_name: 'A',
      });

      const dto = {
        idToken: 'gt',
        target_role: 'Frontend Developer',
        experience_level: 'junior',
      } as any;
      await controller.googleRegisterStart(dto);

      expect(mockAuthService.googleRegisterStart).toHaveBeenCalledWith(dto);
    });
  });

  describe('googleRegisterVerify', () => {
    it('delegates to authService.googleRegisterVerify', async () => {
      mockAuthService.googleRegisterVerify.mockResolvedValue(authResponse);

      await controller.googleRegisterVerify({
        email: 'a@b.com',
        code: '1234',
      });

      expect(mockAuthService.googleRegisterVerify).toHaveBeenCalledWith({
        email: 'a@b.com',
        code: '1234',
      });
    });
  });

  describe('completeGoogleProfile', () => {
    it('delegates to authService.completeGoogleProfile with userId', async () => {
      mockAuthService.completeGoogleProfile.mockResolvedValue({
        message: 'done',
        user: {},
      });

      const dto = {
        full_name: 'A',
        target_role: 'Frontend Developer' as any,
        experience_level: 'junior' as any,
      };
      await controller.completeGoogleProfile('u-1', dto);

      expect(mockAuthService.completeGoogleProfile).toHaveBeenCalledWith(
        'u-1',
        dto,
      );
    });
  });
});
