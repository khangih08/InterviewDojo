import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty({
    description: 'Session ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Device name',
    example: 'Chrome on Windows 10',
    nullable: true,
  })
  device_name!: string | null;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
    nullable: true,
  })
  user_agent!: string | null;

  @ApiProperty({
    description: 'IP address',
    example: '192.168.1.100',
    nullable: true,
  })
  ip_address!: string | null;

  @ApiProperty({
    description: 'Session creation date',
    example: '2024-04-18T10:30:00Z',
  })
  created_at!: Date;

  @ApiProperty({
    description: 'Last accessed date',
    example: '2024-04-18T15:45:00Z',
  })
  last_accessed_at!: Date;

  @ApiProperty({
    description: 'Session expiration date',
    example: '2024-04-25T10:30:00Z',
    nullable: true,
  })
  expires_at!: Date | null;

  @ApiProperty({
    description: 'Is session active',
    example: true,
  })
  is_active!: boolean;
}

export class RevokeSessionResponse {
  @ApiProperty({
    description: 'Success message',
    example: 'Session revoked successfully',
  })
  message!: string;
}

export class RevokeAllSessionsResponse {
  @ApiProperty({
    description: 'Success message',
    example: 'All sessions revoked successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Number of sessions revoked',
    example: 3,
  })
  revoked_count!: number;
}
