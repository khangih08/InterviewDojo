import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tag } from "src/entities/tag.entity";
import { Repository } from "typeorm";

@Injectable()
export class TagsService {
    constructor(
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>,
    ) {}

    create(data: any) {
        const category = this.tagRepository.create(data);
        return this.tagRepository.save(category);
    }

    findAll() {
        return this.tagRepository.find({ relations: ['posts']});
    }
}