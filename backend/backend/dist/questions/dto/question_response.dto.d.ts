export declare class QuestionResponseDto {
    id: string;
    content: string;
    sampleAnswer?: string | null;
    difficultyLevel: number;
    categoryName?: string | null;
    categoryId?: string | null;
    tags: string[];
    createdAt: Date;
}
