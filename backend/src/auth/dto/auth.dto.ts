export class RegisterDto {
  email: string;
  password: string;
  full_name: string;
  target_role: string;
  experience_level: string;
}

export class LoginDto {
  email: string;
  password: string;
}
