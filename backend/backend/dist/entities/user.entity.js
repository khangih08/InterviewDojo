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
exports.User = exports.ExperienceLevel = exports.Role = exports.JobRole = void 0;
const typeorm_1 = require("typeorm");
var JobRole;
(function (JobRole) {
    JobRole["BACKEND"] = "Backend Developer";
    JobRole["FRONTEND"] = "Frontend Developer";
    JobRole["FULLSTACK"] = "Fullstack Developer";
    JobRole["AI_ENGINEER"] = "AI Engineer";
})(JobRole || (exports.JobRole = JobRole = {}));
var Role;
(function (Role) {
    Role["USER"] = "user";
    Role["ADMIN"] = "admin";
})(Role || (exports.Role = Role = {}));
var ExperienceLevel;
(function (ExperienceLevel) {
    ExperienceLevel["INTERN"] = "intern";
    ExperienceLevel["FRESHER"] = "fresher";
    ExperienceLevel["JUNIOR"] = "junior";
    ExperienceLevel["MIDDLE"] = "middle";
    ExperienceLevel["SENIOR"] = "senior";
})(ExperienceLevel || (exports.ExperienceLevel = ExperienceLevel = {}));
let User = class User {
    id;
    email;
    password;
    full_name;
    target_role;
    experience_level;
    role;
    refreshToken;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "full_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: JobRole,
    }),
    __metadata("design:type", String)
], User.prototype, "target_role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ExperienceLevel,
    }),
    __metadata("design:type", String)
], User.prototype, "experience_level", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Role,
        default: Role.USER,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "refreshToken", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
;
//# sourceMappingURL=user.entity.js.map