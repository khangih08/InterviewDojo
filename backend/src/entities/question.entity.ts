import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TagRelation } from './tag_relation.entity';
import { Category } from './category.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string; // Question content

  @Column({ type: 'text', nullable: true })
  sampleAnswer: string; // Example answer 

  @Column({ type: 'int', default: 1 })
  difficultyLevel: number; // Difficulty level (1-5)

  // Relational property for TagRelation
  @OneToMany(() => TagRelation, (tagRelation) => tagRelation.question, {
    cascade: true, // Auto-save TagRelation when saving Question
  })
  tagRelations: TagRelation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.questions, {
    onDelete: 'SET NULL', // If Category is deleted, set categoryId to null
    nullable: true,
  })

  @JoinColumn({ name: 'category_id' })
  category?: Category;
}
