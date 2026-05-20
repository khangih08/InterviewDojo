/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../src/common/redis/redis.service';

const mockRedisClient = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  disconnect: jest.fn(),
  on: jest.fn(),
};

jest.mock('ioredis', () => ({
  Redis: jest.fn().mockImplementation(() => mockRedisClient),
}));

import { Redis } from 'ioredis';

describe('RedisService', () => {
  let service: RedisService;
  let configService: { get: jest.Mock };

  const setupService = async (redisUrl: string | undefined) => {
    configService = { get: jest.fn().mockReturnValue(redisUrl) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient.on.mockImplementation(() => mockRedisClient);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('onModuleInit', () => {
    it('initializes Redis client when REDIS_URL is set', async () => {
      await setupService('redis://localhost:6379');
      service.onModuleInit();

      expect(Redis).toHaveBeenCalledWith('redis://localhost:6379');
      expect(mockRedisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockRedisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('trims whitespace from REDIS_URL', async () => {
      await setupService('  redis://localhost:6379  ');
      service.onModuleInit();

      expect(Redis).toHaveBeenCalledWith('redis://localhost:6379');
    });

    it('extracts URL when REDIS_URL contains -u flag (redis-cli format)', async () => {
      await setupService('redis-cli -u redis://localhost:6379');
      service.onModuleInit();

      expect(Redis).toHaveBeenCalledWith('redis://localhost:6379');
    });

    it('logs error and returns when REDIS_URL is not defined', async () => {
      await setupService(undefined);
      const loggerSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();

      service.onModuleInit();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('REDIS_URL'),
      );
      expect(Redis).not.toHaveBeenCalled();
    });

    it('logs error when Redis constructor throws', async () => {
      await setupService('redis://localhost:6379');
      (Redis as unknown as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Connection refused');
      });

      const loggerSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();
      service.onModuleInit();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(Error),
      );
    });

    it('logs message on connect event', async () => {
      await setupService('redis://localhost:6379');
      const loggerSpy = jest.spyOn((service as any).logger, 'log').mockImplementation();

      mockRedisClient.on.mockImplementation((event: string, cb: () => void) => {
        if (event === 'connect') cb();
        return mockRedisClient;
      });

      service.onModuleInit();

      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Connected'));
    });

    it('logs error on Redis error event', async () => {
      await setupService('redis://localhost:6379');
      const loggerSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();
      const fakeError = new Error('Redis error');

      mockRedisClient.on.mockImplementation((event: string, cb: (e: Error) => void) => {
        if (event === 'error') cb(fakeError);
        return mockRedisClient;
      });

      service.onModuleInit();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Redis connection error'),
        fakeError,
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('disconnects Redis client when client exists', async () => {
      await setupService('redis://localhost:6379');
      service.onModuleInit();

      service.onModuleDestroy();

      expect(mockRedisClient.disconnect).toHaveBeenCalled();
    });

    it('does not throw when Redis client was never initialized', async () => {
      await setupService(undefined);
      jest.spyOn((service as any).logger, 'error').mockImplementation();
      service.onModuleInit();

      expect(() => service.onModuleDestroy()).not.toThrow();
    });
  });

  describe('set', () => {
    beforeEach(async () => {
      await setupService('redis://localhost:6379');
      service.onModuleInit();
    });

    it('calls set with EX when ttl is provided', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      await service.set('myKey', 'myValue', 300);

      expect(mockRedisClient.set).toHaveBeenCalledWith('myKey', 'myValue', 'EX', 300);
    });

    it('calls set without EX when ttl is not provided', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      await service.set('myKey', 'myValue');

      expect(mockRedisClient.set).toHaveBeenCalledWith('myKey', 'myValue');
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      await setupService('redis://localhost:6379');
      service.onModuleInit();
    });

    it('returns the stored value', async () => {
      mockRedisClient.get.mockResolvedValue('storedValue');

      const result = await service.get('myKey');

      expect(result).toBe('storedValue');
      expect(mockRedisClient.get).toHaveBeenCalledWith('myKey');
    });

    it('returns null when key does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.get('nonExistentKey');

      expect(result).toBeNull();
    });
  });

  describe('del', () => {
    beforeEach(async () => {
      await setupService('redis://localhost:6379');
      service.onModuleInit();
    });

    it('calls del with the correct key', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      await service.del('myKey');

      expect(mockRedisClient.del).toHaveBeenCalledWith('myKey');
    });
  });

  describe('getClient', () => {
    it('returns the underlying Redis client', async () => {
      await setupService('redis://localhost:6379');
      service.onModuleInit();

      const client = service.getClient();

      expect(client).toBe(mockRedisClient);
    });
  });
});
