import { Column, Entity, PrimaryGeneratedColumn, } from "typeorm";
import { TagRelation } from "./tag_relation.entity";
import { OneToMany } from "typeorm";

@Entity('tags')
export class Tag {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;
    
    @OneToMany(() => TagRelation, (tagRelation) => tagRelation.tag)
    tagRelations: TagRelation[];
}