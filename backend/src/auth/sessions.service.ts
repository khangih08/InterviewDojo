import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from 'src/entities/session.entity';
import { SessionResponseDto } from './dto/session.dto';

@Injectable()
export class SessionsService {
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;

  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
  ) {}

  /**
   * Create a new session
   */
  async createSession(
    userId: string,
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<Session> {
    const deviceName = this.parseDeviceNameFromUserAgent(userAgent);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    const session = this.sessionsRepository.create({
      user_id: userId,
      refresh_token: refreshToken,
      device_name: deviceName,
      user_agent: userAgent || null,
      ip_address: ipAddress || null,
      expires_at: expiresAt,
      is_active: true,
    });

    return this.sessionsRepository.save(session);
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionResponseDto[]> {
    const sessions = await this.sessionsRepository.find({
      where: {
        user_id: userId,
        is_active: true,
      },
      order: {
        created_at: 'DESC',
      },
    });

    return sessions.map(this.mapToSessionResponse);
  }

  /**
   * Get a specific session
   */
  async getSession(sessionId: string, userId: string): Promise<Session> {
    const session = await this.sessionsRepository.findOne({
      where: {
        id: sessionId,
        user_id: userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSession(sessionId, userId);
    session.is_active = false;
    await this.sessionsRepository.save(session);
  }

  /**
   * Revoke all sessions for a user except the current one
   */
  async revokeAllOtherSessions(
    userId: string,
    currentSessionId?: string,
  ): Promise<number> {
    const query = this.sessionsRepository
      .createQueryBuilder()
      .update()
      .set({ is_active: false })
      .where('user_id = :userId', { userId });

    if (currentSessionId) {
      query.andWhere('id != :currentSessionId', { currentSessionId });
    }

    const result = await query.execute();
    return result.affected || 0;
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllSessions(userId: string): Promise<number> {
    const result = await this.sessionsRepository.update(
      { user_id: userId },
      { is_active: false },
    );
    return result.affected || 0;
  }

  /**
   * Update session last accessed time
   */
  async updateSessionLastAccessed(sessionId: string): Promise<void> {
    await this.sessionsRepository.update(sessionId, {
      last_accessed_at: new Date(),
    });
  }

  /**
   * Verify if a session is still valid
   */
  async isSessionValid(sessionId: string, userId: string): Promise<boolean> {
    const session = await this.sessionsRepository.findOne({
      where: {
        id: sessionId,
        user_id: userId,
        is_active: true,
      },
    });

    if (!session) {
      return false;
    }

    // Check if session has expired
    if (session.expires_at && new Date() > session.expires_at) {
      session.is_active = false;
      await this.sessionsRepository.save(session);
      return false;
    }

    return true;
  }

  /**
   * Get session by refresh token
   */
  async getSessionByRefreshToken(
    refreshToken: string,
    userId: string,
  ): Promise<Session | null> {
    return this.sessionsRepository.findOne({
      where: {
        refresh_token: refreshToken,
        user_id: userId,
        is_active: true,
      },
    });
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.sessionsRepository
      .createQueryBuilder()
      .update()
      .set({ is_active: false })
      .where('expires_at < NOW()')
      .andWhere('is_active = true')
      .execute();

    return result.affected || 0;
  }

  /**
   * Delete old inactive sessions (older than 30 days)
   */
  async deleteOldInactiveSessions(daysOld: number = 30): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    const result = await this.sessionsRepository.delete({
      is_active: false,
      created_at: date,
    });

    return result.affected || 0;
  }

  /**
   * Parse device name from user agent
   */
  private parseDeviceNameFromUserAgent(userAgent?: string): string | null {
    if (!userAgent) {
      return null;
    }

    if (userAgent.includes('Windows')) {
      if (userAgent.includes('Chrome')) return 'Chrome on Windows';
      if (userAgent.includes('Firefox')) return 'Firefox on Windows';
      if (userAgent.includes('Safari')) return 'Safari on Windows';
      return 'Windows Device';
    } else if (userAgent.includes('Mac')) {
      if (userAgent.includes('Chrome')) return 'Chrome on macOS';
      if (userAgent.includes('Safari')) return 'Safari on macOS';
      return 'macOS Device';
    } else if (userAgent.includes('Linux')) {
      return 'Linux Device';
    } else if (userAgent.includes('iPhone')) {
      return 'iPhone';
    } else if (userAgent.includes('iPad')) {
      return 'iPad';
    } else if (userAgent.includes('Android')) {
      return 'Android Device';
    }

    return 'Unknown Device';
  }

  /**
   * Map session entity to response DTO
   */
  private mapToSessionResponse(session: Session): SessionResponseDto {
    return {
      id: session.id,
      device_name: session.device_name,
      user_agent: session.user_agent,
      ip_address: session.ip_address,
      created_at: session.created_at,
      last_accessed_at: session.last_accessed_at,
      expires_at: session.expires_at,
      is_active: session.is_active,
    };
  }
}
