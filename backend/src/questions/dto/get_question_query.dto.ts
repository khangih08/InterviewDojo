import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GetQuestionQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    page?: any;

    @ApiPropertyOptional()
    @IsOptional()
    limit?: any;
}