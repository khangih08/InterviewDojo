export declare enum JobRole {
    BACKEND = "Backend Developer",
    FRONTEND = "Frontend Developer",
    FULLSTACK = "Fullstack Developer",
    AI_ENGINEER = "AI Engineer"
}
export declare enum ExperienceLevel {
    INTERN = "intern",
    FRESHER = "fresher",
    JUNIOR = "junior",
    MIDDLE = "middle",
    SENIOR = "senior"
}
export declare class RegisterDto {
    email: string;
    password: string;
    full_name: string;
    target_role: JobRole;
    experience_level: ExperienceLevel;
}
