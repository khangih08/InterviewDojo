import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ type: 'uuid', nullable: true }) user_id: string;

  @Column({ default: 'FREE' }) type: 'FREE' | 'TARGETED';
  @Column({ nullable: true }) job_title: string;
  @Column({ type: 'text', nullable: true }) job_description: string;
  @Column({ type: 'text', nullable: true }) cv_text: string;
  @CreateDateColumn() created_at: Date;
}