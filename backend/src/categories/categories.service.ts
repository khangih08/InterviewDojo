import { Injectable } from "@nestjs/common";
import { Category } from "../entities/category.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) {}

    create(data: any) {
        const category = this.categoryRepository.create(data);
        return this.categoryRepository.save(category);
    }

    findAll() {
        return this.categoryRepository.find({ relations: ['posts']});
    }
}