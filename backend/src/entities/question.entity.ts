import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TagRelation } from './tag_relation.entity';
import { Category } from './category.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  sampleAnswer: string;

  @Column({ type: 'int', default: 1 })
  difficultyLevel: number;

  @OneToMany(() => TagRelation, (tagRelation) => tagRelation.question, {
    cascade: true,
  })
  tagRelations: TagRelation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.questions, {
    onDelete: 'SET NULL',
    nullable: true,
  })

  @JoinColumn({ name: 'category_id' })
  category?: Category;
}