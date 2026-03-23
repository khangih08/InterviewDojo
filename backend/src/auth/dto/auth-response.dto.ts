import { ExperienceLevel, JobRole, Role } from "src/entities/user.entity";

export class AuthResponseDto {
    accessToken: string
    refreshToken: string;
    user: {
        id: string;
        email: string;
        full_name: string;
        target_role: JobRole;
        experience_level: ExperienceLevel;
        role: Role; 
    }
}