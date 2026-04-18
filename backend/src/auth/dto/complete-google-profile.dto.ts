import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { ExperienceLevel, JobRole } from './register.dto';

export class CompleteGoogleProfileDto {
  @ApiProperty({
    description: 'User full name',
    example: 'Nguyen Van A',
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  full_name!: string;

  @ApiProperty({
    enum: JobRole,
    description: 'Target role',
    example: JobRole.BACKEND,
  })
  @IsEnum(JobRole, { message: 'Target role must be a valid job role' })
  target_role!: JobRole;

  @ApiProperty({
    enum: ExperienceLevel,
    description: 'Experience level',
    example: ExperienceLevel.JUNIOR,
  })
  @IsEnum(ExperienceLevel, {
    message: 'Experience level must be a valid experience level',
  })
  experience_level!: ExperienceLevel;
}
