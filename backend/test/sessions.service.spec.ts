/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { SessionsService } from '../src/auth/sessions.service';
import { Session } from '../src/entities/session.entity';

describe('SessionsService', () => {
  let service: SessionsService;
  let sessionsRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  beforeEach(async () => {
    sessionsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getRepositoryToken(Session),
          useValue: sessionsRepository,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates session with detected device name from user-agent', async () => {
    const created = {
      id: 'session-1',
      user_id: 'user-1',
      refresh_token: 'refresh-token',
      device_name: 'Chrome on Windows',
      user_agent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit Chrome/118.0',
      ip_address: '127.0.0.1',
      is_active: true,
      created_at: new Date(),
      last_accessed_at: new Date(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    sessionsRepository.create.mockReturnValue(created);
    sessionsRepository.save.mockResolvedValue(created);

    const result = await service.createSession(
      'user-1',
      'refresh-token',
      created.user_agent,
      '127.0.0.1',
    );

    expect(result).toEqual(created);
    expect(sessionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        refresh_token: 'refresh-token',
        device_name: 'Chrome on Windows',
        user_agent: created.user_agent,
        ip_address: '127.0.0.1',
        is_active: true,
      }),
    );
  });

  it('throws NotFoundException when session is missing', async () => {
    sessionsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.getSession('missing-session', 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('returns false and deactivates session when session is expired', async () => {
    const expiredSession = {
      id: 'session-expired',
      user_id: 'user-1',
      refresh_token: 'token',
      is_active: true,
      expires_at: new Date(Date.now() - 60_000),
    } as Session;

    sessionsRepository.findOne.mockResolvedValue(expiredSession);
    sessionsRepository.save.mockResolvedValue({
      ...expiredSession,
      is_active: false,
    });

    const result = await service.isSessionValid('session-expired', 'user-1');

    expect(result).toBe(false);
    expect(sessionsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'session-expired',
        is_active: false,
      }),
    );
  });
});
