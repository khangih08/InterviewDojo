import { RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './auth-response.dto';
import { LoginDto } from './login.dto';
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
