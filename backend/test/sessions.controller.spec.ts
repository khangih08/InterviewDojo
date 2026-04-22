/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from '../src/auth/sessions.controller';
import { SessionsService } from '../src/auth/sessions.service';

const mockSessionsService = {
  getUserSessions: jest.fn(),
  getSession: jest.fn(),
  revokeSession: jest.fn(),
  revokeAllOtherSessions: jest.fn(),
  revokeAllSessions: jest.fn(),
};

const now = new Date();
const sessionDto = {
  id: 's-1',
  device_name: 'Chrome on Windows',
  user_agent: 'Mozilla/5.0 (Windows) Chrome/120',
  ip_address: '127.0.0.1',
  created_at: now,
  last_accessed_at: now,
  expires_at: new Date(Date.now() + 86_400_000),
  is_active: true,
};

describe('SessionsController', () => {
  let controller: SessionsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        { provide: SessionsService, useValue: mockSessionsService },
      ],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSessions', () => {
    it('returns all active sessions for user', async () => {
      mockSessionsService.getUserSessions.mockResolvedValue([sessionDto]);

      const result = await controller.getSessions('u-1');

      expect(mockSessionsService.getUserSessions).toHaveBeenCalledWith('u-1');
      expect(result).toEqual([sessionDto]);
    });
  });

  describe('getSession', () => {
    it('returns session details for given id and user', async () => {
      const fullSession = {
        ...sessionDto,
        user_id: 'u-1',
        refresh_token: 'rt-abc',
      } as any;
      mockSessionsService.getSession.mockResolvedValue(fullSession);

      const result = await controller.getSession('s-1', 'u-1');

      expect(mockSessionsService.getSession).toHaveBeenCalledWith('s-1', 'u-1');
      expect(result.id).toBe('s-1');
      expect(result).not.toHaveProperty('refresh_token');
    });
  });

  describe('revokeSession', () => {
    it('revokes session and returns success message', async () => {
      mockSessionsService.revokeSession.mockResolvedValue(undefined);

      const result = await controller.revokeSession('s-1', 'u-1');

      expect(mockSessionsService.revokeSession).toHaveBeenCalledWith(
        's-1',
        'u-1',
      );
      expect(result.message).toContain('revoked');
    });
  });

  describe('revokeAllOtherSessions', () => {
    it('revokes all sessions except current and returns count', async () => {
      mockSessionsService.revokeAllOtherSessions.mockResolvedValue(3);

      const mockReq = { sessionId: 's-current' };
      const result = await controller.revokeAllOtherSessions('u-1', mockReq);

      expect(mockSessionsService.revokeAllOtherSessions).toHaveBeenCalledWith(
        'u-1',
        's-current',
      );
      expect(result.message).toContain('revoked');
      expect(result.revoked_count).toBe(3);
    });
  });

  describe('revokeAllSessions', () => {
    it('revokes all sessions for user and returns count', async () => {
      mockSessionsService.revokeAllSessions.mockResolvedValue(5);

      const result = await controller.revokeAllSessions('u-1');

      expect(mockSessionsService.revokeAllSessions).toHaveBeenCalledWith('u-1');
      expect(result.message).toContain('revoked');
      expect(result.revoked_count).toBe(5);
    });
  });
});
