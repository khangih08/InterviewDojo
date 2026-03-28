import { TagRelation } from './tag_relation.entity';
import { Category } from './category.entity';
export declare class Question {
    id: string;
    content: string;
    sampleAnswer: string;
    difficultyLevel: number;
    tagRelations: TagRelation[];
    createdAt: Date;
    updatedAt: Date;
    category?: Category;
}
