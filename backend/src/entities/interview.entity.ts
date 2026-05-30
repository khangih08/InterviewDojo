import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Message } from './message.entity'; // Đảm bảo bạn đã import đúng file Message Entity

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  // Trạng thái cuộc phỏng vấn (Dùng để check xem đã xong để hiện báo cáo chưa)
  @Column({ type: 'varchar', default: 'IN_PROGRESS' })
  status: string;

  @Column({ type: 'varchar', default: 'THEORY' })
  current_phase: string;

  @Column({ type: 'varchar', default: 'FREE' })
  type: 'FREE' | 'TARGETED';

  @Column({ type: 'varchar', nullable: true })
  job_title: string;

  @Column({ type: 'varchar', nullable: true })
  experience_level: string;

  @Column({ type: 'text', nullable: true })
  job_description: string;

  @Column({ type: 'text', nullable: true })
  cv_text: string;

  @Column({ type: 'text', nullable: true })
  last_code: string;

  // --- PHẦN QUAN TRỌNG: CÁC CỘT CHO BÁO CÁO ---

  @Column({ type: 'text', nullable: true })
  final_report: string; // Nội dung nhận xét chi tiết (Markdown)

  @Column({ type: 'float', nullable: true, default: 0 })
  average_score: number;

  @Column({ type: 'float', default: 0 })
  score_theory: number;

  @Column({ type: 'float', default: 0 })
  score_coding: number;

  @Column({ type: 'float', default: 0 })
  score_softskills: number;

  @Column({ type: 'json', nullable: true })
  radar_data: number[]; // Mảng số cho biểu đồ Radar

  @Column({ type: 'json', nullable: true })
  learning_path: any; // Danh sách lộ trình học tập gợi ý

  // --- PHẦN THÊM MỚI: Định nghĩa quan hệ để sửa lỗi QueryBuilder ---
  // Một cuộc phỏng vấn (Interview) có nhiều tin nhắn (Message)
  @OneToMany(() => Message, (message) => message.interview)
  messages: Message[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}