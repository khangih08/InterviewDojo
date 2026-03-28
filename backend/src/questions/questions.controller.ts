import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorator/roles.decorator';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  /**
   * [ADMIN] Create a new question
   * Requires: Admin role, JWT authentication
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.createQuestion(createQuestionDto);
  }

  /**
   * [USER/ADMIN] View list of questions (with filtering by tagId, categoryId)
   * Requires: JWT authentication
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('tagId') tagId?: string,
  ) {
    return this.questionsService.getQuestions(categoryId, tagId);
  }

  /**
   * [USER/ADMIN] View details of a specific question
   * Requires: JWT authentication
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.questionsService.getQuestionById(id);
  }

  /**
   * [ADMIN] Update a specific question
   * Requires: Admin role, JWT authentication
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionsService.updateQuestion(id, updateQuestionDto);
  }

  /**
   * [ADMIN] Delete a specific question
   * Requires: Admin role, JWT authentication
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.questionsService.deleteQuestion(id);
  }
}
