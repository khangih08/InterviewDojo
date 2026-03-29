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
exports.TagController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tags_service_1 = require("./tags.service");
const create_tag_dto_1 = require("./dto/create_tag.dto");
const update_tag_dto_1 = require("./dto/update_tag.dto");
const tag_entity_1 = require("../entities/tag.entity");
let TagController = class TagController {
    tagService;
    constructor(tagService) {
        this.tagService = tagService;
    }
    create(createTagDto) {
        return this.tagService.create(createTagDto);
    }
    findAll() {
        return this.tagService.findAll();
    }
    search(query) {
        return this.tagService.searchTags(query);
    }
    findOne(id) {
        return this.tagService.findOne(id);
    }
    update(id, updateTagDto) {
        return this.tagService.update(id, updateTagDto);
    }
    remove(id) {
        return this.tagService.remove(id);
    }
};
exports.TagController = TagController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new tag' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'The tag has been successfully created.',
        type: tag_entity_1.Tag
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'Tag name already exists.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tag_dto_1.CreateTagDto]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tags' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Return all tags sorted alphabetically.',
        type: [tag_entity_1.Tag]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TagController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search tags by name (Autocomplete)' }),
    (0, swagger_1.ApiQuery)({ name: 'q', description: 'Search keyword', example: 'java' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: [tag_entity_1.Tag] }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tag details by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Tag UUID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: tag_entity_1.Tag }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Tag not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a tag' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Tag UUID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Tag updated successfully.', type: tag_entity_1.Tag }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Tag not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tag_dto_1.UpdateTagDto]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a tag' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Tag UUID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT, description: 'Tag deleted successfully.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "remove", null);
exports.TagController = TagController = __decorate([
    (0, swagger_1.ApiTags)('Tags'),
    (0, common_1.Controller)('tags'),
    __metadata("design:paramtypes", [tags_service_1.TagService])
], TagController);
//# sourceMappingURL=tags.controller.js.map