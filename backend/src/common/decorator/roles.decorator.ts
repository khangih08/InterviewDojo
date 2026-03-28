import { SetMetadata } from '@nestjs/common';

export enum Role {
    Admin = 'admin',
    User = 'user',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
