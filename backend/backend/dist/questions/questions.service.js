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
const tag_entity_1 = require("../entities/tag.entity");
const tag_relation_entity_1 = require("../entities/tag_relation.entity");
const category_entity_1 = require("../entities/category.entity");
let QuestionsService = class QuestionsService {
    questionRepository;
    categoryRepository;
    tagRepository;
    constructor(questionRepository, categoryRepository, tagRepository) {
        this.questionRepository = questionRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
    }
    async create(createDto) {
        const category = await this.categoryRepository.findOneBy({ id: createDto.categoryId });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        const question = this.questionRepository.create({
            content: createDto.content,
            sampleAnswer: createDto.sampleAnswer,
            difficultyLevel: createDto.difficultyLevel,
            category: category,
        });
        if (createDto.tagIds && createDto.tagIds.length > 0) {
            const tags = await this.tagRepository.findBy({ id: (0, typeorm_2.In)(createDto.tagIds) });
            question.tagRelations = tags.map((tag) => {
                const relation = new tag_relation_entity_1.TagRelation();
                relation.tag = tag;
                return relation;
            });
        }
        const savedQuestion = await this.questionRepository.save(question);
        return this.mapToResponse(savedQuestion);
    }
    async findAll(query) {
        const { search, categoryId, difficulty, page = 1, limit = 10 } = query;
        const queryBuilder = this.questionRepository
            .createQueryBuilder('question')
            .leftJoinAndSelect('question.category', 'category')
            .leftJoinAndSelect('question.tagRelations', 'tagRelations')
            .leftJoinAndSelect('tagRelations.tag', 'tag')
            .skip((page - 1) * limit)
            .take(limit);
        if (search) {
            queryBuilder.andWhere('question.content ILike :search', { search: `%${search}%` });
        }
        if (categoryId) {
            queryBuilder.andWhere('category.id = :categoryId', { categoryId });
        }
        if (difficulty) {
            queryBuilder.andWhere('question.difficultyLevel = :difficulty', { difficulty });
        }
        const [items, total] = await queryBuilder.getManyAndCount();
        return {
            data: items.map((q) => this.mapToResponse(q)),
            meta: { total, page, limit },
        };
    }
    async findOne(id) {
        const question = await this.questionRepository.findOne({
            where: { id },
            relations: ['category', 'tagRelations', 'tagRelations.tag'],
        });
        if (!question)
            throw new common_1.NotFoundException('Question not found');
        return this.mapToResponse(question);
    }
    async update(id, updateDto) {
        const question = await this.questionRepository.findOne({
            where: { id },
            relations: ['category', 'tagRelations'],
        });
        if (!question)
            throw new common_1.NotFoundException('Question not found');
        if (updateDto.categoryId) {
            const category = await this.categoryRepository.findOneBy({ id: updateDto.categoryId });
            if (!category)
                throw new common_1.NotFoundException('Category not found');
            question.category = category;
        }
        if (updateDto.tagIds) {
            const tags = await this.tagRepository.findBy({ id: (0, typeorm_2.In)(updateDto.tagIds) });
            question.tagRelations = tags.map((tag) => {
                const relation = new tag_relation_entity_1.TagRelation();
                relation.tag = tag;
                return relation;
            });
        }
        if (updateDto.content)
            question.content = updateDto.content;
        if (updateDto.sampleAnswer)
            question.sampleAnswer = updateDto.sampleAnswer;
        if (updateDto.difficultyLevel)
            question.difficultyLevel = updateDto.difficultyLevel;
        const updatedQuestion = await this.questionRepository.save(question);
        return this.mapToResponse(updatedQuestion);
    }
    async remove(id) {
        const question = await this.findOne(id);
        await this.questionRepository.delete(id);
        return { message: `Question ${id} has been deleted` };
    }
    mapToResponse(q) {
        return {
            id: q.id,
            content: q.content,
            sampleAnswer: q.sampleAnswer || '',
            difficultyLevel: q.difficultyLevel,
            categoryId: q.category?.id,
            categoryName: q.category?.name ?? 'Uncategorized',
            tags: q.tagRelations?.map((tr) => tr.tag.name) || [],
            createdAt: q.createdAt,
        };
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(question_entity_1.Question)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(tag_entity_1.Tag)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map