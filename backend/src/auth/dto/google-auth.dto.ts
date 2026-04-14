import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { JobRole, ExperienceLevel } from "./register.dto";

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google ID token', example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...' })
  @IsString()
  @IsNotEmpty({ message: 'Google token is required' })
  idToken!: string;
}

export class GoogleRegisterStartDto {
  @ApiProperty({ description: 'Google ID token', example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...' })
  @IsString()
  @IsNotEmpty({ message: 'Google token is required' })
  idToken!: string;

  @ApiProperty({ enum: JobRole, description: 'The target job role of the user', example: JobRole.BACKEND })
  @IsNotEmpty()
  @IsEnum(JobRole, { message: 'Target role must be a valid job role' })
  target_role!: JobRole;

  @ApiProperty({ enum: ExperienceLevel, description: 'Years of experience level', example: ExperienceLevel.JUNIOR })
  @IsNotEmpty()
  @IsEnum(ExperienceLevel, { message: 'Experience level must be a valid experience level' })
  experience_level!: ExperienceLevel;
}

export class GoogleRegisterVerifyDto {
  @ApiProperty({ description: 'User email address', example: 'interview@gmail.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({ description: '4 digit verification code', example: '5784' })
  @IsString()
  @Length(4, 4, { message: 'Verification code must be 4 digits' })
  code!: string;
}
