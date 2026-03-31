import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export enum JobRole {
  BACKEND = 'Backend Developer',
  FRONTEND = 'Frontend Developer',
  FULLSTACK = 'Fullstack Developer',
  AI_ENGINEER = 'AI Engineer',
  DEVOPS = 'DevOps Engineer',
  DATA_SCIENTIST = 'Data Scientist',
  CLOUD_ENGINEER = 'Cloud Engineer',
  MOBILE_DEVELOPER = 'Mobile Developer',
  SECURITY_ENGINEER = 'Security Engineer',
  EMBEDDED_ENGINEER = 'Embedded Systems Engineer',
}

export enum ExperienceLevel  {
  INTERN = 'intern',
  FRESHER = 'fresher',
  JUNIOR = 'junior',
  MIDDLE = 'middle',
  SENIOR = 'senior',
}

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'interview@gmail.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Strongpass0@!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' })
  password: string; 

  @ApiProperty({
    description: 'User fullname',
    example: 'Nam Nguyen',
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  full_name: string;

  @ApiProperty({ 
    enum: JobRole, 
    description: 'The target job role of the user',
    example: JobRole.BACKEND
  })
  @IsNotEmpty()
  @IsEnum(JobRole, { message: 'Target role must be a valid job role' })
  target_role: JobRole;

  @ApiProperty({ 
    enum: ExperienceLevel, 
    description: 'Years of experience level',
    example: ExperienceLevel.JUNIOR
  })
  @IsNotEmpty()
  @IsEnum(ExperienceLevel, { message: 'Experience level must be a valid experience level' })
  experience_level: ExperienceLevel;
}

