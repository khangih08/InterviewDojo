/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SessionsService } from '../src/auth/sessions.service';
import { Session } from '../src/entities/session.entity';

describe('SessionsService', () => {
  let service: SessionsService;
  let sessionsRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  const now = new Date();
  const future = new Date(Date.now() + 86_400_000);

  const baseSession: Partial<Session> = {
    id: 's-1',
    user_id: 'u-1',
    refresh_token: 'rt-abc',
    device_name: 'Chrome on Windows',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/120',
    ip_address: '127.0.0.1',
    created_at: now,
    last_accessed_at: now,
    expires_at: future,
    is_active: true,
  };

  let qbMock: {
    update: jest.Mock;
    set: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    execute: jest.Mock;
  };

  beforeEach(async () => {
    qbMock = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 2 }),
    };

    sessionsRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(qbMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: getRepositoryToken(Session), useValue: sessionsRepo },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    it('creates and saves a session with correct fields', async () => {
      sessionsRepo.create.mockReturnValue(baseSession);
      sessionsRepo.save.mockResolvedValue(baseSession);

      const result = await service.createSession(
        'u-1',
        'rt-abc',
        'Mozilla/5.0 (Windows NT 10.0) Chrome/120',
        '127.0.0.1',
      );

      expect(sessionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'u-1', is_active: true }),
      );
      expect(result).toEqual(baseSession);
    });

    it('parses Chrome on Windows from user agent', async () => {
      sessionsRepo.create.mockReturnValue(baseSession);
      sessionsRepo.save.mockResolvedValue(baseSession);

      await service.createSession(
        'u-1',
        'rt',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit Chrome/120',
        undefined,
      );

      expect(sessionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ device_name: 'Chrome on Windows' }),
      );
    });

    it('creates session with null device for missing user agent', async () => {
      sessionsRepo.create.mockReturnValue({ ...baseSession, device_name: null });
      sessionsRepo.save.mockResolvedValue({ ...baseSession, device_name: null });

      await service.createSession('u-1', 'rt-abc', undefined, undefined);

      expect(sessionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ device_name: null }),
      );
    });

    it('sets expiry date 7 days in the future', async () => {
      sessionsRepo.create.mockReturnValue(baseSession);
      sessionsRepo.save.mockResolvedValue(baseSession);

      await service.createSession('u-1', 'rt-abc');

      const createCall = sessionsRepo.create.mock.calls[0][0];
      const daysUntilExpiry =
        (createCall.expires_at.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      expect(daysUntilExpiry).toBeCloseTo(7, 0);
    });
  });

  describe('getUserSessions', () => {
    it('returns mapped DTOs for active user sessions', async () => {
      sessionsRepo.find.mockResolvedValue([baseSession]);
      const result = await service.getUserSessions('u-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('s-1');
      expect(result[0].device_name).toBe('Chrome on Windows');
      expect(result[0].is_active).toBe(true);
    });

    it('returns empty array when user has no sessions', async () => {
      sessionsRepo.find.mockResolvedValue([]);
      const result = await service.getUserSessions('u-1');
      expect(result).toEqual([]);
    });

    it('queries only active sessions ordered by created_at DESC', async () => {
      sessionsRepo.find.mockResolvedValue([]);
      await service.getUserSessions('u-1');
      expect(sessionsRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'u-1', is_active: true },
          order: { created_at: 'DESC' },
        }),
      );
    });
  });

  describe('getSession', () => {
    it('returns session when found', async () => {
      sessionsRepo.findOne.mockResolvedValue(baseSession);
      const result = await service.getSession('s-1', 'u-1');
      expect(result).toEqual(baseSession);
    });

    it('throws NotFoundException when session not found', async () => {
      sessionsRepo.findOne.mockResolvedValue(null);
      await expect(service.getSession('missing', 'u-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('revokeSession', () => {
    it('sets is_active to false and saves', async () => {
      const session = { ...baseSession };
      sessionsRepo.findOne.mockResolvedValue(session);
      sessionsRepo.save.mockResolvedValue({ ...session, is_active: false });

      await service.revokeSession('s-1', 'u-1');

      expect(sessionsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: false }),
      );
    });

    it('throws NotFoundException when session does not exist', async () => {
      sessionsRepo.findOne.mockResolvedValue(null);
      await expect(service.revokeSession('missing', 'u-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('revokeAllOtherSessions', () => {
    it('uses query builder and returns affected count', async () => {
      const result = await service.revokeAllOtherSessions('u-1', 's-current');
      expect(qbMock.update).toHaveBeenCalled();
      expect(qbMock.execute).toHaveBeenCalled();
      expect(result).toBe(2);
    });

    it('works without currentSessionId', async () => {
      const result = await service.revokeAllOtherSessions('u-1');
      expect(result).toBe(2);
      expect(qbMock.andWhere).not.toHaveBeenCalled();
    });

    it('adds andWhere clause when currentSessionId given', async () => {
      await service.revokeAllOtherSessions('u-1', 'keep-me');
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('currentSessionId'),
        expect.objectContaining({ currentSessionId: 'keep-me' }),
      );
    });
  });

  describe('revokeAllSessions', () => {
    it('deactivates all sessions for user and returns count', async () => {
      sessionsRepo.update.mockResolvedValue({ affected: 3 });
      const result = await service.revokeAllSessions('u-1');

      expect(sessionsRepo.update).toHaveBeenCalledWith(
        { user_id: 'u-1' },
        { is_active: false },
      );
      expect(result).toBe(3);
    });

    it('returns 0 when no sessions were deactivated', async () => {
      sessionsRepo.update.mockResolvedValue({ affected: 0 });
      const result = await service.revokeAllSessions('u-1');
      expect(result).toBe(0);
    });
  });

  describe('isSessionValid', () => {
    it('returns true for active non-expired session', async () => {
      sessionsRepo.findOne.mockResolvedValue(baseSession);
      const result = await service.isSessionValid('s-1', 'u-1');
      expect(result).toBe(true);
    });

    it('returns false when session not found', async () => {
      sessionsRepo.findOne.mockResolvedValue(null);
      const result = await service.isSessionValid('missing', 'u-1');
      expect(result).toBe(false);
    });

    it('deactivates and returns false for expired session', async () => {
      const expired = {
        ...baseSession,
        expires_at: new Date(Date.now() - 1000),
      };
      sessionsRepo.findOne.mockResolvedValue(expired);
      sessionsRepo.save.mockResolvedValue({ ...expired, is_active: false });

      const result = await service.isSessionValid('s-1', 'u-1');

      expect(result).toBe(false);
      expect(sessionsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: false }),
      );
    });

    it('returns true when session has no expiry date', async () => {
      sessionsRepo.findOne.mockResolvedValue({
        ...baseSession,
        expires_at: null,
      });
      const result = await service.isSessionValid('s-1', 'u-1');
      expect(result).toBe(true);
    });
  });

  describe('getSessionByRefreshToken', () => {
    it('returns session matching refresh token', async () => {
      sessionsRepo.findOne.mockResolvedValue(baseSession);
      const result = await service.getSessionByRefreshToken('rt-abc', 'u-1');
      expect(result).toEqual(baseSession);
    });

    it('returns null when no match', async () => {
      sessionsRepo.findOne.mockResolvedValue(null);
      const result = await service.getSessionByRefreshToken('bad-token', 'u-1');
      expect(result).toBeNull();
    });
  });

  describe('cleanupExpiredSessions', () => {
    it('uses query builder and returns affected count', async () => {
      const result = await service.cleanupExpiredSessions();
      expect(qbMock.execute).toHaveBeenCalled();
      expect(result).toBe(2);
    });
  });

  describe('updateSessionLastAccessed', () => {
    it('updates last_accessed_at timestamp', async () => {
      sessionsRepo.update.mockResolvedValue({ affected: 1 });
      await service.updateSessionLastAccessed('s-1');

      expect(sessionsRepo.update).toHaveBeenCalledWith(
        's-1',
        expect.objectContaining({ last_accessed_at: expect.any(Date) }),
      );
    });
  });
});
