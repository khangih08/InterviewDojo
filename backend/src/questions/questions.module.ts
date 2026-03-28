import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { Question } from '../entities/question.entity';
import { TagRelation } from '../entities/tag_relation.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Question, TagRelation])],
  controllers: [QuestionsController],
  providers: [QuestionsService, RolesGuard],
  exports: [QuestionsService],
})
export class QuestionsModule {}
