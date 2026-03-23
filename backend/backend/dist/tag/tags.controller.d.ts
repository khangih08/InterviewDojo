import { CreateTagDto, UpdateTagDto } from './tag.dto';
export declare class TagsController {
    create(createTagDto: CreateTagDto): {
        message: string;
        data: CreateTagDto;
    };
    findAll(): {
        message: string;
    };
    findOne(id: string): {
        message: string;
    };
    update(id: string, updateTagDto: UpdateTagDto): {
        message: string;
        data: UpdateTagDto;
    };
    remove(id: string): {
        message: string;
    };
}
