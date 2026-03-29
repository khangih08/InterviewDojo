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
exports.QuestionResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class QuestionResponseDto {
    id;
    content;
    sampleAnswer;
    difficultyLevel;
    categoryName;
    categoryId;
    tags;
    createdAt;
}
exports.QuestionResponseDto = QuestionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], QuestionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], QuestionResponseDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'This is a sample answer' }),
    __metadata("design:type", Object)
], QuestionResponseDto.prototype, "sampleAnswer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], QuestionResponseDto.prototype, "difficultyLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Frontend' }),
    __metadata("design:type", Object)
], QuestionResponseDto.prototype, "categoryName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-123' }),
    __metadata("design:type", Object)
], QuestionResponseDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], example: ['React', 'Hooks'] }),
    __metadata("design:type", Array)
], QuestionResponseDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], QuestionResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=question_response.dto.js.map