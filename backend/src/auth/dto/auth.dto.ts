import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";
import { ExperienceLevel } from "src/entities/user.entity";

export enum JobRole {
  BACKEND = 'Backend Developer',
  FRONTEND = 'Frontend Developer',
  FULLSTACK = 'Fullstack Developer',
  AI_ENGINEER = 'AI Engineer'
}

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' })
  password: string; 

  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  full_name: string;

  @IsNotEmpty()
  @IsEnum(JobRole, { message: 'Target role must be a valid job role' })
  target_role: JobRole;

  @IsNotEmpty()
  @IsEnum(ExperienceLevel, { message: 'Experience level must be a valid experience level' })
  experience_level: ExperienceLevel;
}

