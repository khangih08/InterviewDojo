import { ExperienceLevel, JobRole, Role, UserPlan } from "src/entities/user.entity";

export class UserResponseDto {
    id: string;

    email: string;

    full_name: string;

    target_role: JobRole;

    experience_level: ExperienceLevel;

    role: Role;

    plan: UserPlan;

    credits: number;
}