import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    refresh(userId: string): Promise<AuthResponseDto>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
}
