/// <reference types="jest" />

// Intercept createParamDecorator to capture the inner factory callback.
// global is used instead of a let variable because jest.mock is hoisted
// above all variable declarations in the file.
jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    createParamDecorator: (fn: (...args: unknown[]) => unknown) => {
      (global as Record<string, unknown>).__getUserDecoratorFn = fn;
      return actual.createParamDecorator(fn);
    },
  };
});

// Import AFTER mock so the module loads with our intercepted createParamDecorator
import { GetUser } from '../src/common/decorator/get-user.decorator';

function getFactory(): (data: string | undefined, ctx: unknown) => unknown {
  return (global as Record<string, unknown>).__getUserDecoratorFn as (
    data: string | undefined,
    ctx: unknown,
  ) => unknown;
}

function makeCtx(user: Record<string, unknown> | undefined) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  };
}

describe('GetUser decorator', () => {
  // Ensure the module was imported and the factory was captured
  it('registers the decorator without error', () => {
    expect(GetUser).toBeDefined();
    expect(getFactory()).toBeInstanceOf(Function);
  });

  it('returns the full user object when no data key is provided', () => {
    const user = { id: 'u-1', email: 'a@b.com', role: 'user' };
    const result = getFactory()(undefined, makeCtx(user));
    expect(result).toBe(user);
  });

  it('returns a specific property when a data key is provided', () => {
    const user = { id: 'u-1', email: 'a@b.com' };
    const result = getFactory()('email', makeCtx(user));
    expect(result).toBe('a@b.com');
  });

  it('returns the id property when data key is "id"', () => {
    const user = { id: 'u-42', email: 'x@y.com' };
    const result = getFactory()('id', makeCtx(user));
    expect(result).toBe('u-42');
  });

  it('returns undefined when user is undefined and no data key', () => {
    const result = getFactory()(undefined, makeCtx(undefined));
    expect(result).toBeUndefined();
  });

  it('returns undefined when user is undefined and a data key is specified', () => {
    const result = getFactory()('email', makeCtx(undefined));
    expect(result).toBeUndefined();
  });
});
