import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsUUID, IsNotEmpty, Max, Min, IsInt } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'The content of the question',
    example: 'What is a Closure in JS?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'The sample answer for this question',
    example: 'A Closure is a function that has access to its outer function scope even after the outer function has returned.',
  })
  @IsString()
  @IsOptional()
  sampleAnswer?: string;

  // UUID of the Category
  @ApiProperty({
    description: 'UUID of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  // Difficulty level from 1 to 5
  @ApiProperty({ 
    description: '1-Very Easy, 2-Easy, 3-Medium, 4-Hard, 5-Very Hard', 
    example: 1 
  })
  @IsInt()
  @Min(1)
  @Max(5)
  difficultyLevel: number;

  @ApiPropertyOptional({ 
    description: 'Array of Tag UUIDs', 
    example: ['tag-uuid-1', 'tag-uuid-2'],
    type: [String] 
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}