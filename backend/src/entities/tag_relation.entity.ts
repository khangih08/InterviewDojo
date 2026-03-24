import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Question } from './question.entity';
import { Tag } from './tag.entity';

@Entity('tag_relations')
export class TagRelation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Question, (question) => question.tagRelations, {
    onDelete: 'CASCADE', 
  })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => Tag, (tag) => tag.tagRelations, {
    onDelete: 'CASCADE', 
  })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
}
