import { Tag } from "src/entities/tag.entity";
import { Repository } from "typeorm";
export declare class TagsService {
    private tagRepository;
    constructor(tagRepository: Repository<Tag>);
    create(data: any): Promise<Tag[]>;
    findAll(): Promise<Tag[]>;
}
