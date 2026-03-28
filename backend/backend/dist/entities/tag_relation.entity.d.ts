import { Question } from './question.entity';
import { Tag } from './tag.entity';
export declare class TagRelation {
    id: string;
    question: Question;
    tag: Tag;
}
