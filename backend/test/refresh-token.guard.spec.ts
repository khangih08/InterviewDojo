/// <reference types="jest" />

import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenGuard } from '../src/auth/guards/refresh-token.guard';

describe('RefreshTokenGuard', () => {
  let guard: RefreshTokenGuard;

  const createContext = (): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({}) }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    guard = new RefreshTokenGuard();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('delegates canActivate to the jwt-refresh AuthGuard and returns true', () => {
    jest
      .spyOn(AuthGuard('jwt-refresh').prototype, 'canActivate')
      .mockReturnValue(true);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('delegates canActivate to the jwt-refresh AuthGuard and returns false', () => {
    jest
      .spyOn(AuthGuard('jwt-refresh').prototype, 'canActivate')
      .mockReturnValue(false);

    expect(guard.canActivate(createContext())).toBe(false);
  });

  it('passes the execution context to the parent canActivate', () => {
    const spy = jest
      .spyOn(AuthGuard('jwt-refresh').prototype, 'canActivate')
      .mockReturnValue(true);

    const context = createContext();
    guard.canActivate(context);

    expect(spy).toHaveBeenCalledWith(context);
  });
});
