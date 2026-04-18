import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { SessionsService } from './sessions.service';
import {
  SessionResponseDto,
  RevokeSessionResponse,
  RevokeAllSessionsResponse,
} from './dto/session.dto';

@ApiTags('sessions')
@Controller('sessions')
@ApiBearerAuth()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * Get all active sessions for the current user
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all active sessions',
    description: 'Retrieve a list of all active sessions for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active sessions',
    isArray: true,
    type: SessionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getSessions(
    @GetUser('id') userId: string,
  ): Promise<SessionResponseDto[]> {
    return this.sessionsService.getUserSessions(userId);
  }

  /**
   * Get a specific session
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get session details',
    description: 'Retrieve details of a specific session',
  })
  @ApiResponse({
    status: 200,
    description: 'Session details',
    type: SessionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getSession(
    @Param('id') sessionId: string,
    @GetUser('id') userId: string,
  ): Promise<SessionResponseDto> {
    const session = await this.sessionsService.getSession(sessionId, userId);
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

  /**
   * Revoke a specific session
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke a specific session',
    description: 'Log out from a specific session',
  })
  @ApiResponse({
    status: 200,
    description: 'Session revoked successfully',
    type: RevokeSessionResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async revokeSession(
    @Param('id') sessionId: string,
    @GetUser('id') userId: string,
  ): Promise<RevokeSessionResponse> {
    await this.sessionsService.revokeSession(sessionId, userId);
    return { message: 'Session revoked successfully' };
  }

  /**
   * Revoke all other sessions (keep current session active)
   */
  @Delete('revoke/all-other')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke all other sessions',
    description: 'Log out from all sessions except the current one',
  })
  @ApiResponse({
    status: 200,
    description: 'All other sessions revoked successfully',
    type: RevokeAllSessionsResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async revokeAllOtherSessions(
    @GetUser('id') userId: string,
    @Req() req: any,
  ): Promise<RevokeAllSessionsResponse> {
    // Try to get current session ID from request if available
    const currentSessionId = req.sessionId;
    const revokedCount = await this.sessionsService.revokeAllOtherSessions(
      userId,
      currentSessionId,
    );
    return {
      message: 'All other sessions revoked successfully',
      revoked_count: revokedCount,
    };
  }

  /**
   * Revoke all sessions for the current user
   */
  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke all sessions',
    description: 'Log out from all sessions',
  })
  @ApiResponse({
    status: 200,
    description: 'All sessions revoked successfully',
    type: RevokeAllSessionsResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async revokeAllSessions(
    @GetUser('id') userId: string,
  ): Promise<RevokeAllSessionsResponse> {
    const revokedCount = await this.sessionsService.revokeAllSessions(userId);
    return {
      message: 'All sessions revoked successfully',
      revoked_count: revokedCount,
    };
  }
}
