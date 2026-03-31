import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum JobRole {
  BACKEND = 'Backend Developer',
  FRONTEND = 'Frontend Developer',
  FULLSTACK = 'Fullstack Developer',
  AI_ENGINEER = 'AI Engineer',
  DEVOPS = 'DevOps Engineer',
  DATA_SCIENTIST = 'Data Scientist',
  CLOUD_ENGINEER = 'Cloud Engineer',
  MOBILE_DEVELOPER = 'Mobile Developer',
  SECURITY_ENGINEER = 'Security Engineer',
  EMBEDDED_ENGINEER = 'Embedded Systems Engineer',
}

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export enum ExperienceLevel {
  INTERN = 'intern',
  FRESHER = 'fresher',
  JUNIOR = 'junior',
  MIDDLE = 'middle',
  SENIOR = 'senior',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    email: string;

    @Column({select: false})
    password: string;

    @Column()
    full_name: string;

    @Column({
        type: 'enum',
        enum: JobRole,
    })
    target_role: JobRole;

    @Column({
        type: 'enum',
        enum: ExperienceLevel,
    })
    experience_level: ExperienceLevel;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER,
    })
    role: Role;

    @Column({ type: 'text', nullable: true })
    refreshToken: string | null;
};
