import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  user_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'text' })
  refresh_token!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  device_name!: string | null;

  @Column({ type: 'text', nullable: true })
  user_agent!: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  last_accessed_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at!: Date | null;

  @Column({ default: true })
  is_active!: boolean;
}
