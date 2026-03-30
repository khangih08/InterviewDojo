export declare enum JobRole {
    BACKEND = "Backend Developer",
    FRONTEND = "Frontend Developer",
    FULLSTACK = "Fullstack Developer",
    AI_ENGINEER = "AI Engineer",
    DEVOPS = "DevOps Engineer",
    DATA_SCIENTIST = "Data Scientist",
    CLOUD_ENGINEER = "Cloud Engineer",
    MOBILE_DEVELOPER = "Mobile Developer",
    SECURITY_ENGINEER = "Security Engineer",
    EMBEDDED_ENGINEER = "Embedded Systems Engineer"
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
