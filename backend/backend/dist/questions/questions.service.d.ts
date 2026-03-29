import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { Tag } from '../entities/tag.entity';
import { Category } from '../entities/category.entity';
import { CreateQuestionDto } from './dto/create_question.dto';
import { UpdateQuestionDto } from './dto/update_question.dto';
import { GetQuestionQueryDto } from './dto/get_question_query.dto';
import { QuestionResponseDto } from './dto/question_response.dto';
export declare class QuestionsService {
    private readonly questionRepository;
    private readonly categoryRepository;
    private readonly tagRepository;
    constructor(questionRepository: Repository<Question>, categoryRepository: Repository<Category>, tagRepository: Repository<Tag>);
    create(createDto: CreateQuestionDto): Promise<QuestionResponseDto>;
    findAll(query: GetQuestionQueryDto): Promise<{
        data: QuestionResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>;
    findOne(id: string): Promise<QuestionResponseDto>;
    update(id: string, updateDto: UpdateQuestionDto): Promise<QuestionResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
    private mapToResponse;
}
