/// <reference types="jest" />

import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';

describe('JwtStrategy', () => {
  let userRepository: { findOne: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue('jwt-secret'),
    };
  });

  it('throws when JWT secret is missing', () => {
    configService.get.mockReturnValue(undefined);

    expect(
      () =>
        new JwtStrategy(
          userRepository as any,
          configService as unknown as ConfigService,
        ),
    ).toThrow(InternalServerErrorException);
  });

  it('returns the selected user when payload is valid', async () => {
    const strategy = new JwtStrategy(
      userRepository as any,
      configService as unknown as ConfigService,
    );
    const user = {
      id: 'u-1',
      email: 'user@example.com',
      full_name: 'User',
      role: 'user',
    };
    userRepository.findOne.mockResolvedValue(user);

    await expect(
      strategy.validate({ sub: 'u-1', email: 'user@example.com', role: 'user' }),
    ).resolves.toEqual(user);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'u-1' },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
      },
    });
  });

  it('throws UnauthorizedException when user is not found', async () => {
    const strategy = new JwtStrategy(
      userRepository as any,
      configService as unknown as ConfigService,
    );
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 'missing', email: 'x@y.com', role: 'user' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
