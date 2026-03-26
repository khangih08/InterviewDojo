import { IsString, IsOptional, IsArray, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  sampleAnswer?: string;

  // UUID of the Category
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  // Array of Tag's UUIDs
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  tagIds?: string[];
}