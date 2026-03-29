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
exports.TagService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tag_entity_1 = require("../entities/tag.entity");
let TagService = class TagService {
    tagRepository;
    constructor(tagRepository) {
        this.tagRepository = tagRepository;
    }
    async create(createTagDto) {
        const existingTag = await this.tagRepository.findOne({
            where: { name: createTagDto.name },
        });
        if (existingTag) {
            throw new common_1.ConflictException(`Tag with name "${createTagDto.name}" already exists`);
        }
        const newTag = this.tagRepository.create(createTagDto);
        return await this.tagRepository.save(newTag);
    }
    async findAll() {
        return await this.tagRepository.find({
            order: { name: 'ASC' },
        });
    }
    async findOne(id) {
        const tag = await this.tagRepository.findOne({
            where: { id },
            relations: ['tagRelations', 'tagRelations.question'],
        });
        if (!tag) {
            throw new common_1.NotFoundException(`Tag with ID "${id}" not found`);
        }
        return tag;
    }
    async searchTags(query) {
        return await this.tagRepository.find({
            where: { name: (0, typeorm_2.Like)(`%${query}%`) },
            take: 10,
        });
    }
    async update(id, updateTagDto) {
        const tag = await this.findOne(id);
        if (updateTagDto.name && updateTagDto.name !== tag.name) {
            const nameExists = await this.tagRepository.findOne({
                where: { name: updateTagDto.name },
            });
            if (nameExists) {
                throw new common_1.ConflictException('New tag name already exists');
            }
        }
        Object.assign(tag, updateTagDto);
        return await this.tagRepository.save(tag);
    }
    async remove(id) {
        const tag = await this.findOne(id);
        await this.tagRepository.remove(tag);
    }
    async findByIds(ids) {
        if (!ids || ids.length === 0)
            return [];
        return await this.tagRepository.find({
            where: {
                id: (0, typeorm_2.In)(ids),
            },
        });
    }
};
exports.TagService = TagService;
exports.TagService = TagService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tag_entity_1.Tag)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TagService);
//# sourceMappingURL=tags.service.js.map