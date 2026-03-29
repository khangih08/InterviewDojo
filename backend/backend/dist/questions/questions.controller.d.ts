import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create_question.dto';
import { GetQuestionQueryDto } from './dto/get_question_query.dto';
import { QuestionResponseDto } from './dto/question_response.dto';
import { UpdateQuestionDto } from './dto/update_question.dto';
export declare class QuestionsController {
    private readonly questionsService;
    constructor(questionsService: QuestionsService);
    create(createQuestionDto: CreateQuestionDto): Promise<QuestionResponseDto>;
    findAll(query: GetQuestionQueryDto): Promise<{
        data: QuestionResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>;
    findOne(id: string): Promise<QuestionResponseDto>;
    update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<QuestionResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
