import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TagRelation } from './tag_relation.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string; // Nội dung câu hỏi

  @Column({ type: 'text', nullable: true })
  sampleAnswer: string; // Đáp án mẫu hoặc gợi ý trả lời

  @Column({ type: 'int', default: 1 })
  difficultyLevel: number; // Tùy chọn: Độ khó (1: Dễ, 2: TB, 3: Khó)

  // Mối quan hệ với bảng trung gian TagRelation
  @OneToMany(() => TagRelation, (tagRelation) => tagRelation.question, {
    cascade: true, // Cho phép tự động lưu TagRelation khi tạo Question
  })
  tagRelations: TagRelation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
