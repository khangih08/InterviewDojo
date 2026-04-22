/// <reference types="jest" />

import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RefreshTokenStrategy } from '../src/auth/strategies/refresh-token.strategy';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('RefreshTokenStrategy', () => {
  let strategy: RefreshTokenStrategy;
  let userRepository: { findOne: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
    };
    configService = {
      get: jest.fn().mockReturnValue('refresh-secret'),
    };

    strategy = new RefreshTokenStrategy(
      configService as unknown as ConfigService,
      userRepository as any,
    );
  });

  it('throws when authorization header is missing', async () => {
    await expect(
      strategy.validate({ headers: {} } as any, {
        sub: 'u-1',
        email: 'user@example.com',
        role: 'user',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws when token is empty after extraction', async () => {
    await expect(
      strategy.validate(
        { headers: { authorization: 'Bearer   ' } } as any,
        { sub: 'u-1', email: 'user@example.com', role: 'user' },
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws when user or stored refresh token is missing', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      strategy.validate(
        { headers: { authorization: 'Bearer refresh-token' } } as any,
        { sub: 'u-1', email: 'user@example.com', role: 'user' },
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws when refresh token does not match', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 'u-1',
      email: 'user@example.com',
      full_name: 'User',
      target_role: 'Frontend Developer',
      experience_level: 'junior',
      role: 'user',
      refreshToken: 'hashed-token',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      strategy.validate(
        { headers: { authorization: 'Bearer refresh-token' } } as any,
        { sub: 'u-1', email: 'user@example.com', role: 'user' },
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('returns the sanitized user when refresh token matches', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 'u-1',
      email: 'user@example.com',
      full_name: 'User',
      target_role: 'Frontend Developer',
      experience_level: 'junior',
      role: 'user',
      refreshToken: 'hashed-token',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(
      strategy.validate(
        { headers: { authorization: 'Bearer refresh-token' } } as any,
        { sub: 'u-1', email: 'user@example.com', role: 'user' },
      ),
    ).resolves.toEqual({
      id: 'u-1',
      email: 'user@example.com',
      full_name: 'User',
      target_role: 'Frontend Developer',
      experience_level: 'junior',
      role: 'user',
    });
  });
});
