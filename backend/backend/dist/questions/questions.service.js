"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const question_entity_1 = require("../entities/question.entity");
const tag_relation_entity_1 = require("../entities/tag_relation.entity");
let QuestionsService = class QuestionsService {
    questionsRepository;
    tagRelationsRepository;
    constructor(questionsRepository, tagRelationsRepository) {
        this.questionsRepository = questionsRepository;
        this.tagRelationsRepository = tagRelationsRepository;
    }
    async createQuestion(createDto) {
        const { content, sampleAnswer, categoryId, tagIds } = createDto;
        const newQuestion = this.questionsRepository.create({
            content,
            sampleAnswer,
            category: categoryId ? { id: categoryId } : undefined,
        });
        const savedQuestion = await this.questionsRepository.save(newQuestion);
        if (tagIds && tagIds.length > 0) {
            const tagRelationsToSave = tagIds.map((tagId) => {
                return this.tagRelationsRepository.create({
                    question: { id: savedQuestion.id },
                    tag: { id: tagId },
                });
            });
            await this.tagRelationsRepository.save(tagRelationsToSave);
        }
        return this.getQuestionById(savedQuestion.id);
    }
    async getQuestions(categoryId, tagId) {
        const query = this.questionsRepository
            .createQueryBuilder('question')
            .leftJoinAndSelect('question.category', 'category')
            .leftJoinAndSelect('question.tagRelations', 'tagRelation')
            .leftJoinAndSelect('tagRelation.tag', 'tag');
        if (categoryId) {
            query.andWhere('category.id = :categoryId', { categoryId });
        }
        if (tagId) {
            query.andWhere('tag.id = :tagId', { tagId });
        }
        query.orderBy('question.createdAt', 'DESC');
        return query.getMany();
    }
    async getQuestionById(id) {
        const question = await this.questionsRepository.findOne({
            where: { id },
            relations: ['category', 'tagRelations', 'tagRelations.tag'],
        });
        if (!question) {
            throw new common_1.NotFoundException(`Câu hỏi với ID ${id} không tồn tại`);
        }
        return question;
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(question_entity_1.Question)),
    __param(1, (0, typeorm_1.InjectRepository)(tag_relation_entity_1.TagRelation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map