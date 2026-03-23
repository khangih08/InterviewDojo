import { UnauthorizedException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Request } from "express";


@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private configService: ConfigService,
        @InjectRepository(User)
        private userRepository: Repository<User>,

    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,
            passReqToCallback: true,
        })
    }

    // validate refresh token
    async validate(req: Request, payload: { sub: string; email: string; role: string }) {
        console.log('RefreshTokenStrategy.validate called');
        console.log('Payload', {sub: payload.sub, email: payload.email, role: payload.role});

        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            console.log('No Authorization header found');
            throw new UnauthorizedException('Refresh token not provided');
        }

        const refreshToken = authHeader.replace('Bearer ', '').trim();
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is empty after extraction');
        }

        const user = await this.userRepository.findOne({ 
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                full_name: true,
                target_role: true,
                experience_level: true,
                role: true,
                refreshToken: true,
            },
        });

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!refreshTokenMatches) {
            throw new UnauthorizedException('Invalid refresh does not match');
        }

        return {
            id: user.id, 
            email: user.email, 
            full_name: user.full_name, 
            target_role: user.target_role, 
            experience_level: user.experience_level, 
            role: user.role
        };
    }
}