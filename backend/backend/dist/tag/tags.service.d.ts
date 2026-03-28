import { Repository } from 'typeorm';
import { Tag } from 'src/entities/tag.entity';
import { CreateTagDto } from './dto/create_tag.dto';
import { UpdateTagDto } from './dto/update_tag.dto';
export declare class TagService {
    private readonly tagRepository;
    constructor(tagRepository: Repository<Tag>);
    create(createTagDto: CreateTagDto): Promise<Tag>;
    findAll(): Promise<Tag[]>;
    findOne(id: string): Promise<Tag>;
    searchTags(query: string): Promise<Tag[]>;
    update(id: string, updateTagDto: UpdateTagDto): Promise<Tag>;
    remove(id: string): Promise<void>;
    findByIds(ids: string[]): Promise<Tag[]>;
}
