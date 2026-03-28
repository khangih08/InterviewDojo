import { TagService } from './tags.service';
import { CreateTagDto } from './dto/create_tag.dto';
import { UpdateTagDto } from './dto/update_tag.dto';
import { Tag } from 'src/entities/tag.entity';
export declare class TagController {
    private readonly tagService;
    constructor(tagService: TagService);
    create(createTagDto: CreateTagDto): Promise<Tag>;
    findAll(): Promise<Tag[]>;
    search(query: string): Promise<Tag[]>;
    findOne(id: string): Promise<Tag>;
    update(id: string, updateTagDto: UpdateTagDto): Promise<Tag>;
    remove(id: string): Promise<void>;
}
