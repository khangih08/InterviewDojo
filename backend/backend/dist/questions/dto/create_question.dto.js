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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQuestionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateQuestionDto {
    content;
    sampleAnswer;
    categoryId;
    difficultyLevel;
    tagIds;
}
exports.CreateQuestionDto = CreateQuestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The content of the question',
        example: 'What is a Closure in JS?',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The sample answer for this question',
        example: 'A Closure is a function that has access to its outer function scope even after the outer function has returned.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "sampleAnswer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UUID of the category',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '1-Very Easy, 2-Easy, 3-Medium, 4-Hard, 5-Very Hard',
        example: 1
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateQuestionDto.prototype, "difficultyLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Array of Tag UUIDs',
        example: ['tag-uuid-1', 'tag-uuid-2'],
        type: [String]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateQuestionDto.prototype, "tagIds", void 0);
//# sourceMappingURL=create_question.dto.js.map