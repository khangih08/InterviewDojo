import { Repository } from 'typeorm';
import { Category } from 'src/entities/category.entity';
import { CreateCategoryDto } from './dto/create_category.dto';
import { UpdateCategoryDto } from './dto/update_category.dto';
import { GetCategoriesQueryDto } from './dto/category_query.dto';
export declare class CategoriesService {
    private readonly categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    create(createCategoryDto: CreateCategoryDto): Promise<Category>;
    findAll(query: GetCategoriesQueryDto): Promise<{
        data: Category[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>;
    findOne(id: string): Promise<Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
