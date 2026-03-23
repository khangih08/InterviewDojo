import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
export declare class CategoriesController {
    create(createCategoryDto: CreateCategoryDto): {
        message: string;
        data: CreateCategoryDto;
    };
    findAll(): {
        message: string;
    };
    findOne(id: string): {
        message: string;
    };
    update(id: string, updateCategoryDto: UpdateCategoryDto): {
        message: string;
        data: UpdateCategoryDto;
    };
    remove(id: string): {
        message: string;
    };
}
