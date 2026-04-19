import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageDto {
  @ApiProperty({ example: 'user' })
  @IsIn(['user', 'assistant', 'system'])
  role: string;

  @ApiProperty({ example: 'Tôi muốn phỏng vấn React' })
  @IsString()
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({ type: [MessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
}