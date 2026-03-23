"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const user_entity_1 = require("../../entities/user.entity");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    UserRepository;
    jwtService;
    configService;
    SALT_ROUNDS = 12;
    constructor(UserRepository, jwtService, configService) {
        this.UserRepository = UserRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto) {
        const { email, password, full_name, target_role, experience_level } = registerDto;
        const existingUser = await this.UserRepository.findOne({
            where: { email }
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
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
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    target_role: user.target_role,
                    experience_level: user.experience_level,
                    role: user.role,
                },
            };
        }
        catch (error) {
            console.error('Error during user registration:', error);
            throw new common_1.ConflictException('Error creating user: ' + error.message);
        }
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const refreshId = (0, crypto_1.randomBytes)(16).toString('hex');
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '15m' }),
            this.jwtService.signAsync({ ...payload, refreshId }, { expiresIn: '7d' }),
        ]);
        return { accessToken, refreshToken };
    }
    async updateRefreshToken(userId, refreshToken) {
        await this.UserRepository.update(userId, { refreshToken });
    }
    async refreshToken(userId) {
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
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
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
        };
    }
    async logout(userId) {
        await this.UserRepository.update(userId, { refreshToken: null });
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.UserRepository.findOne({
            where: { email },
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
            throw new common_1.UnauthorizedException('Invalid email or password ');
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
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map