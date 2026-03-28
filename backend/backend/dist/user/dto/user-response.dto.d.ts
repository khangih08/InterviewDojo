import { ExperienceLevel, JobRole, Role } from "src/entities/user.entity";
export declare class UserResponseDto {
    id: string;
    email: string;
    full_name: string;
    target_role: JobRole;
    experience_level: ExperienceLevel;
    role: Role;
}
