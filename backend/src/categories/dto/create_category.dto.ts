import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateCategoryDto {

    @ApiProperty({
    description: 'The unique name of the category',
    example: 'System Design',
    maxLength: 50,
  })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;
}