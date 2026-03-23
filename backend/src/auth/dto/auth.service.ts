import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { AuthResponseDto } from "./auth-response.dto";
import { RegisterDto } from "./auth.dto";
import { randomBytes } from "crypto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { LoginDto } from "./login.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 12;
    constructor(
        @InjectRepository(User)
        private UserRepository: Repository<User>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        const {email, password, full_name, target_role, experience_level} = registerDto;
        // Check if user already exists
        const existingUser = await this.UserRepository.findOne({
            where: { email }
        });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        try {
            const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
            const userInstance = this.UserRepository.create({
                email,
                password: hashedPassword,
                full_name,
                target_role,
                experience_level,
            });
            const user = await this.UserRepository.save(userInstance);
            const tokens = await this.generateTokens(user.id, user.email, user.role);
            await this.updateRefreshToken(user.id, tokens.refreshToken);
            return {
                ...tokens,
                user : {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                target_role: user.target_role,
                experience_level: user.experience_level,
                role: user.role,
                },
            }
        } catch (error) {
            console.error('Error during user registration:', error);
            throw new ConflictException('Error creating user: ' + error.message);
        }
    }

    private async generateTokens(userId: string, email: string, role: string): 
    Promise<{ accessToken: string; refreshToken: string }> {
        const payload = { sub: userId, email, role };
        const refreshId = randomBytes(16).toString('hex');
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '15m' }),
            this.jwtService.signAsync({ ...payload, refreshId }, { expiresIn: '7d' }),
        ]);

        return { accessToken, refreshToken };
    }

    //Update refresh token in database
    async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
        await this.UserRepository.update(
            userId,
            { refreshToken },
        );
    }

    async refreshToken(userId: string): Promise<AuthResponseDto> {
        const user = await this.UserRepository.findOne({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                full_name: true,
                target_role: true,
                experience_level: true,
                role: true,

            },
        })
        if (!user) {
            throw new UnauthorizedException('User not found')
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                target_role: user.target_role,  
                experience_level: user.experience_level,
                role: user.role,
            },
        }
    }

    // Log out
    async logout(userId: string): Promise<void> {
    await this.UserRepository.update(
        userId, 
        { refreshToken: null });
    }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { email, password } = loginDto;
        const user = await this.UserRepository.findOne({
            where: { email},
            select: [
                'id', 
                'email', 
                'password', 
                'full_name', 
                'role', 
                'target_role', 
                'experience_level'
            ], 
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid email or password ')
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                target_role: user.target_role,  
                experience_level: user.experience_level,
                role: user.role,
            }
        }
    }
}