import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateTagDto {

    @ApiProperty({
        description: 'The name of the tag',
        example: 'Java',
    })
    @IsString()
    @IsNotEmpty({ message: 'Tag name cannot be empty'})
    name: string;
}