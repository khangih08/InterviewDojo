import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) interview_id: string;
  @Column() role: string;
  @Column({ type: 'text' }) content: string;
  @CreateDateColumn() created_at: Date;
}