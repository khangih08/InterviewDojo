import { PartialType } from "@nestjs/swagger";
import { CreateQuestionDto } from "./create_question.dto";

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}