import { Request } from 'express';
import {type ExperienceLevel,type JobRole,type Role } from 'src/entities/user.entity';

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    full_name: string,
    target_role: JobRole,
    experience_level: ExperienceLevel,
    role: Role;
  };
}