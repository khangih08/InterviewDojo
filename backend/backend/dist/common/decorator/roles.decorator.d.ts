export declare enum Role {
    Admin = "admin",
    User = "user"
}
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
