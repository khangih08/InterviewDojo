import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ForgotPasswordRequestDto {
  @ApiProperty({ description: 'Email address of the user', example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;
}

export class ForgotPasswordVerifyDto {
  @ApiProperty({ description: 'Email address of the user', example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({ description: '4-digit verification code sent to email', example: '1234' })
  @IsString()
  @Length(4, 4, { message: 'Verification code must be 4 digits' })
  code!: string;
}

export class ForgotPasswordResetDto {
  @ApiProperty({ description: 'Email address of the user', example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({ description: '4-digit verification code sent to email', example: '1234' })
  @IsString()
  @Length(4, 4, { message: 'Verification code must be 4 digits' })
  code!: string;

  @ApiProperty({ description: 'New password', example: 'StrongP@ssw0rd' })
  @IsString()
  @Length(8, 32, { message: 'Password must be between 8 and 32 characters' })
  @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/ , {
    message: 'Password must contain at least one special character',
  })
  password!: string;
}
