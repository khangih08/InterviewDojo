import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    let redisUrl = this.configService.get<string>('REDIS_URL');
    
    if (redisUrl) {
      redisUrl = redisUrl.trim();
    }

    // Handle the case where the user might have copied the full redis-cli command
    if (redisUrl && redisUrl.includes('-u ')) {
      redisUrl = redisUrl.split('-u ')[1].trim();
    }

    if (!redisUrl) {
      this.logger.error('REDIS_URL is not defined in the environment variables');
      return;
    }

    try {
      this.redisClient = new Redis(redisUrl);

      this.redisClient.on('connect', () => {
        this.logger.log('Connected to Redis successfully');
      });

      this.redisClient.on('error', (err) => {
        this.logger.error('Redis connection error', err);
      });
    } catch (error) {
      this.logger.error('Failed to initialize Redis client', error);
    }
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.set(key, value, 'EX', ttl);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  getClient(): Redis {
    return this.redisClient;
  }
}
