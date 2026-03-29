import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class GetQuestionQueryDto {
    @ApiPropertyOptional({
        description: 'Search in question content'
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Filter by category UUID'
    })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional({
        description: 'Filter by tag UUID'
    })
    @IsOptional()
    @IsString()
    tagId?: string;

    @ApiPropertyOptional({ 
        description: 'Filter by difficulty (1, 2, 3, 4, 5)' 
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    difficulty?: number;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;
}