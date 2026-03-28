import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { TagRelation } from '../entities/tag_relation.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
export declare class QuestionsService {
    private readonly questionsRepository;
    private readonly tagRelationsRepository;
    constructor(questionsRepository: Repository<Question>, tagRelationsRepository: Repository<TagRelation>);
    createQuestion(createDto: CreateQuestionDto): Promise<Question>;
    getQuestions(categoryId?: string, tagId?: string): Promise<Question[]>;
    getQuestionById(id: string): Promise<Question>;
    updateQuestion(id: string, updateDto: UpdateQuestionDto): Promise<Question>;
    deleteQuestion(id: string): Promise<{
        message: string;
    }>;
}
