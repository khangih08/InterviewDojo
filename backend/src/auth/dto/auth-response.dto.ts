import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExperienceLevel, JobRole, Role } from 'src/entities/user.entity';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Access token for authentication',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh token for obtaining new access tokens',
    example:
      'dGhpcy1pcz1hLXJlZnJlc2gtdG9rZW4tZXhhbXBsZS13aXRoLXN1ZmZpY2lhbC1jaGFyYWN0ZXJzIQ==',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Authenticated user information',
    example: {
      id: 'user-1',
      email: 'nam@gmail.com',
      full_name: 'Nam Nguyen',
      target_role: JobRole.BACKEND,
      experience_level: ExperienceLevel.FRESHER,
      role: Role.USER,
    },
  })
  user!: {
    id: string;
    email: string;
    full_name: string;
    target_role: JobRole;
    experience_level: ExperienceLevel;
    role: Role;
  };

  @ApiPropertyOptional({
    description:
      'Whether the client should ask for additional profile info after login',
    example: true,
  })
  requiresProfileCompletion?: boolean;
}
