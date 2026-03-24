import { ConfigService } from "@nestjs/config";
import { Strategy } from "passport-jwt";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { Request } from "express";
declare const RefreshTokenStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class RefreshTokenStrategy extends RefreshTokenStrategy_base {
    private configService;
    private userRepository;
    constructor(configService: ConfigService, userRepository: Repository<User>);
    validate(req: Request, payload: {
        sub: string;
        email: string;
        role: string;
    }): Promise<{
        id: string;
        email: string;
        full_name: string;
        target_role: import("src/entities/user.entity").JobRole;
        experience_level: import("src/entities/user.entity").ExperienceLevel;
        role: import("src/entities/user.entity").Role;
    }>;
}
export {};
