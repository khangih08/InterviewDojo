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
exports.RegisterDto = exports.ExperienceLevel = exports.JobRole = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var JobRole;
(function (JobRole) {
    JobRole["BACKEND"] = "Backend Developer";
    JobRole["FRONTEND"] = "Frontend Developer";
    JobRole["FULLSTACK"] = "Fullstack Developer";
    JobRole["AI_ENGINEER"] = "AI Engineer";
    JobRole["DEVOPS"] = "DevOps Engineer";
    JobRole["DATA_SCIENTIST"] = "Data Scientist";
    JobRole["CLOUD_ENGINEER"] = "Cloud Engineer";
    JobRole["MOBILE_DEVELOPER"] = "Mobile Developer";
    JobRole["SECURITY_ENGINEER"] = "Security Engineer";
    JobRole["EMBEDDED_ENGINEER"] = "Embedded Systems Engineer";
})(JobRole || (exports.JobRole = JobRole = {}));
var ExperienceLevel;
(function (ExperienceLevel) {
    ExperienceLevel["INTERN"] = "intern";
    ExperienceLevel["FRESHER"] = "fresher";
    ExperienceLevel["JUNIOR"] = "junior";
    ExperienceLevel["MIDDLE"] = "middle";
    ExperienceLevel["SENIOR"] = "senior";
})(ExperienceLevel || (exports.ExperienceLevel = ExperienceLevel = {}));
class RegisterDto {
    email;
    password;
    full_name;
    target_role;
    experience_level;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User email address',
        example: 'interview@gmail.com',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email format' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User password',
        example: 'Strongpass0@!',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User fullname',
        example: 'Nam Nguyen',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Full name is required' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "full_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: JobRole,
        description: 'The target job role of the user',
        example: JobRole.BACKEND
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(JobRole, { message: 'Target role must be a valid job role' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "target_role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ExperienceLevel,
        description: 'Years of experience level',
        example: ExperienceLevel.JUNIOR
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(ExperienceLevel, { message: 'Experience level must be a valid experience level' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "experience_level", void 0);
//# sourceMappingURL=register.dto.js.map