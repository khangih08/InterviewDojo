import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuestionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional({ example: 'This is a sample answer' })
  sampleAnswer?: string | null; 

  @ApiProperty({ example: 3 })
  difficultyLevel: number;

  @ApiPropertyOptional({ example: 'Frontend' })
  categoryName?: string | null; 

  @ApiPropertyOptional({ example: 'uuid-123' })
  categoryId?: string | null;

  @ApiProperty({ type: [String], example: ['React', 'Hooks'] })
  tags: string[];

  @ApiProperty()
  createdAt: Date;
}