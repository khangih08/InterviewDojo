import { Category } from "../entities/category.entity";
import { Repository } from "typeorm";
export declare class CategoriesService {
    private categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    create(data: any): Promise<Category[]>;
    findAll(): Promise<Category[]>;
}
