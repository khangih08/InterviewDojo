import { JwtService } from "@nestjs/jwt";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { RegisterDto } from "./dto/register.dto";
import { Repository } from "typeorm";
import { User } from "src/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { ConfigService } from "@nestjs/config";
export declare class AuthService {
    private UserRepository;
    private jwtService;
    private configService;
    private readonly SALT_ROUNDS;
    constructor(UserRepository: Repository<User>, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    private generateTokens;
    updateRefreshToken(userId: string, refreshToken: string): Promise<void>;
    refreshToken(userId: string): Promise<AuthResponseDto>;
    logout(userId: string): Promise<void>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
}
