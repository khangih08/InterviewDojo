export declare enum JobRole {
    BACKEND = "Backend Developer",
    FRONTEND = "Frontend Developer",
    FULLSTACK = "Fullstack Developer",
    AI_ENGINEER = "AI Engineer"
}
export declare enum Role {
    USER = "user",
    ADMIN = "admin"
}
export declare enum ExperienceLevel {
    INTERN = "intern",
    FRESHER = "fresher",
    JUNIOR = "junior",
    MIDDLE = "middle",
    SENIOR = "senior"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    full_name: string;
    target_role: JobRole;
    experience_level: ExperienceLevel;
    role: Role;
    refreshToken: string | null;
}
