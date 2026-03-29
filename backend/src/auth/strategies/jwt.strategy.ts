// Jwt Strategy for auth requests
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
  
    if (!jwtSecret) {
      throw new InternalServerErrorException('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  // Validate JWT payload
  async validate(payload: { sub: string; email: string, role: string }) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}