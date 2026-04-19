import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsService } from './questions.service';
import { QuestionsController } from 'src/questions/questions.controller';
import { Question } from '../entities/question.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { TagRelation } from '../entities/tag_relation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Category, Tag, TagRelation]),
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
