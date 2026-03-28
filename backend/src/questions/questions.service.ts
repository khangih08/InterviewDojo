import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { TagRelation } from '../entities/tag_relation.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(TagRelation)
    private readonly tagRelationsRepository: Repository<TagRelation>,
  ) {}

  /**
   * Create a new question with associated category and tags
   */
  async createQuestion(createDto: CreateQuestionDto): Promise<Question> {
    const { content, sampleAnswer, categoryId, tagIds } = createDto;

    // 1. Initialize a new Question entity 
    const newQuestion = this.questionsRepository.create({
      content,
      sampleAnswer,
      category: categoryId ? { id: categoryId } : undefined,
    });

    // 2. Save the Question to the database to get the generated UUID
    const savedQuestion = await this.questionsRepository.save(newQuestion);

    // 3. Handle tag association (insert into the junction table TagRelation)
    if (tagIds && tagIds.length > 0) {
      const tagRelationsToSave = tagIds.map((tagId) => {
        return this.tagRelationsRepository.create({
          question: { id: savedQuestion.id },
          tag: { id: tagId },
        });
      });

      // Using save() with an array to save all relations at once instead of looping and saving one by one
      await this.tagRelationsRepository.save(tagRelationsToSave);
    }

    // 4. Return the complete question data (including category and tags for easier testing)
    return this.getQuestionById(savedQuestion.id);
  }

  /**
   * Filtering questions by category_id and tag_id
   */
  async getQuestions(categoryId?: string, tagId?: string): Promise<Question[]> {
    // Using QueryBuilder to join tables   (JOIN)
    const query = this.questionsRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category')
      .leftJoinAndSelect('question.tagRelations', 'tagRelation')
      .leftJoinAndSelect('tagRelation.tag', 'tag'); // Lấy luôn tên tag để frontend hiển thị

    // Filtering by category_id
    if (categoryId) {
      query.andWhere('category.id = :categoryId', { categoryId });
    }

    // Filtering by tag_id through the junction table
    if (tagId) {
      query.andWhere('tag.id = :tagId', { tagId });
    }

    // Adding order by createdAt to ensure consistent ordering of results
    query.orderBy('question.createdAt', 'DESC');

    return query.getMany();
  }

  /**
   * Filtering questions by Id
   */
  async getQuestionById(id: string): Promise<Question> {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['category', 'tagRelations', 'tagRelations.tag'],
    });

    if (!question) {
      throw new NotFoundException(`Câu hỏi với ID ${id} không tồn tại`);
    }

    return question;
  }

  /**
   * Update an existing question and replace tag associations when provided
   */
  async updateQuestion(id: string, updateDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.getQuestionById(id);
    const { content, sampleAnswer, categoryId, tagIds } = updateDto;

    if (content !== undefined) {
      question.content = content;
    }

    if (sampleAnswer !== undefined) {
      question.sampleAnswer = sampleAnswer;
    }

    if (categoryId !== undefined) {
      question.category = { id: categoryId } as Question['category'];
    }

    await this.questionsRepository.save(question);

    if (tagIds !== undefined) {
      await this.tagRelationsRepository
        .createQueryBuilder()
        .delete()
        .from(TagRelation)
        .where('question_id = :id', { id })
        .execute();

      if (tagIds.length > 0) {
        const tagRelations = tagIds.map((tagId) =>
          this.tagRelationsRepository.create({
            question: { id },
            tag: { id: tagId },
          }),
        );

        await this.tagRelationsRepository.save(tagRelations);
      }
    }

    return this.getQuestionById(id);
  }

  /**
   * Delete a question by id
   */
  async deleteQuestion(id: string): Promise<{ message: string }> {
    const question = await this.getQuestionById(id);
    await this.questionsRepository.remove(question);

    return {
      message: `Question with ID ${id} deleted successfully`,
    };
  }
}
