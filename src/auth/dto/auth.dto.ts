export class RegisterDto {
  email: string;
  password: string; // Note: matches entity
  full_name: string;
  target_role: string;
  experience_level: string;
}

export class LoginDto {
  email: string;
  pássword: string;
}
