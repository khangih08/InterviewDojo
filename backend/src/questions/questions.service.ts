import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Question } from '../entities/question.entity';
import { Tag } from '../entities/tag.entity';
import { TagRelation } from 'src/entities/tag_relation.entity';
import { Category } from '../entities/category.entity';
import { CreateQuestionDto } from './dto/create_question.dto';
import { UpdateQuestionDto } from './dto/update_question.dto';
import { QuestionResponseDto } from './dto/question_response.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createDto: CreateQuestionDto): Promise<QuestionResponseDto> {
    const category = await this.categoryRepository.findOneBy({ id: createDto.categoryId });
    if (!category) throw new NotFoundException('Category not found');

    const question = this.questionRepository.create({
      content: createDto.content,
      sampleAnswer: createDto.sampleAnswer,
      difficultyLevel: createDto.difficultyLevel,
      category: category,
    });

    if (createDto.tagIds && createDto.tagIds.length > 0) {
      const tags = await this.tagRepository.findBy({ id: In(createDto.tagIds) });
      question.tagRelations = tags.map((tag) => {
        const relation = new TagRelation();
        relation.tag = tag;
        return relation;
      });
    }

    const savedQuestion = await this.questionRepository.save(question);
    return this.mapToResponse(savedQuestion);
  }

  async findAll(query: any) {
    const { categoryId } = query;
    const keyword = String(query.q ?? query.search ?? '').trim();
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const queryBuilder = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category')
      .leftJoinAndSelect('question.tagRelations', 'tagRelations')
      .leftJoinAndSelect('tagRelations.tag', 'tag');

    if (categoryId && categoryId !== 'all' && categoryId !== '') {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    if (keyword) {
      queryBuilder.andWhere('LOWER(question.content) LIKE :keyword', {
        keyword: `%${keyword.toLowerCase()}%`,
      });
    }

    queryBuilder.orderBy('question.createdAt', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items: items.map((q) => this.mapToResponse(q)),
      total: total,
    };
  }

  async findOne(id: string): Promise<QuestionResponseDto> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['category', 'tagRelations', 'tagRelations.tag'],
    });
    if (!question) throw new NotFoundException('Question not found');
    return this.mapToResponse(question);
  }

  async update(id: string, updateDto: UpdateQuestionDto): Promise<QuestionResponseDto> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['category', 'tagRelations'],
    });
    if (!question) throw new NotFoundException('Question not found');

    if (updateDto.categoryId) {
      const category = await this.categoryRepository.findOneBy({ id: updateDto.categoryId });
      if (!category) throw new NotFoundException('Category not found');
      question.category = category;
    }

    if (updateDto.tagIds) {
      const tags = await this.tagRepository.findBy({ id: In(updateDto.tagIds) });

      question.tagRelations = tags.map((tag) => {
        const relation = new TagRelation();
        relation.tag = tag;
        return relation;
      });
    }

    if (updateDto.content) question.content = updateDto.content;
    if (updateDto.sampleAnswer) question.sampleAnswer = updateDto.sampleAnswer;
    if (updateDto.difficultyLevel) question.difficultyLevel = updateDto.difficultyLevel;

    const updatedQuestion = await this.questionRepository.save(question);
    return this.mapToResponse(updatedQuestion);
  }

  async remove(id: string) {
    await this.questionRepository.delete(id);
    return { message: `Question ${id} has been deleted` };
  }

  /**
   * Chuyển đổi Entity sang DTO và xử lý làm sạch dữ liệu JSON từ DB
   */
  private mapToResponse(q: Question): QuestionResponseDto {
    let cleanAnswer = q.sampleAnswer || '';

    // KIỂM TRA VÀ XỬ LÝ JSON NẾU CÓ
    if (cleanAnswer.trim().startsWith('{') || cleanAnswer.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(cleanAnswer);

        // Nếu là định dạng Editor.js (có mảng blocks)
        if (parsed.blocks && Array.isArray(parsed.blocks)) {
          cleanAnswer = parsed.blocks
            .map((block: any) => block.data?.text || '')
            .filter((text: string) => text.length > 0)
            .join('\n'); // Hoặc dùng '<br>' nếu bạn hiển thị HTML trực tiếp
        }
        // Nếu là một JSON object đơn giản, lấy giá trị chuỗi
        else if (typeof parsed === 'object') {
          cleanAnswer = parsed.text || parsed.content || JSON.stringify(parsed);
        }
      } catch (e) {
        // Nếu parse lỗi, giữ nguyên text gốc
        cleanAnswer = q.sampleAnswer || '';
      }
    }

    return {
      id: q.id,
      content: q.content,
      sampleAnswer: cleanAnswer,
      difficultyLevel: q.difficultyLevel,
      categoryId: q.category?.id,
      categoryName: q.category?.name ?? 'Uncategorized',
      tags: q.tagRelations?.map((tr) => tr.tag.name) || [],
      createdAt: q.createdAt,
    };
  }
}