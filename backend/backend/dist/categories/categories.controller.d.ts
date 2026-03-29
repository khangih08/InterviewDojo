import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create_category.dto';
import { UpdateCategoryDto } from './dto/update_category.dto';
import { GetCategoriesQueryDto } from './dto/category_query.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto): Promise<import("../entities/category.entity").Category>;
    findAll(query: GetCategoriesQueryDto): Promise<{
        data: import("../entities/category.entity").Category[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>;
    findOne(id: string): Promise<import("../entities/category.entity").Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<import("../entities/category.entity").Category>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
