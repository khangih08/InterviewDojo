import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
export declare class QuestionsController {
    private readonly questionsService;
    constructor(questionsService: QuestionsService);
    create(createQuestionDto: CreateQuestionDto): Promise<import("../entities/question.entity").Question>;
    findAll(categoryId?: string, tagId?: string): Promise<import("../entities/question.entity").Question[]>;
    findOne(id: string): Promise<import("../entities/question.entity").Question>;
    update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<import("../entities/question.entity").Question>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
