import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

    @Column()
    target_role: string;

    @Column()
    experience_level: string;

    @Column({default: 'candidate'})
    role: string;
};