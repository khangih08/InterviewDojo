import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Interview } from './interview.entity'; // Import Interview entity

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  interview_id: string;

  @Column()
  role: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', nullable: true })
  score: number;

  @Column({ nullable: true })
  phase: string; // Đây chính là 'THEORY' | 'CODING' | 'EVALUATION'

  @Column({ type: 'text', nullable: true })
  code_snippet: string; // Lưu lại trạng thái code lúc gửi tin nhắn này

  // --- PHẦN QUAN TRỌNG: THIẾT LẬP QUAN HỆ ---
  // Nhiều tin nhắn (Message) thuộc về một cuộc phỏng vấn (Interview)
  @ManyToOne(() => Interview, (interview) => interview.messages)
  @JoinColumn({ name: 'interview_id' })
  interview: Interview;

  @CreateDateColumn()
  created_at: Date;
}