import { Column, Entity, PrimaryGeneratedColumn, } from "typeorm";

@Entity('tags')
export class Tag {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;    
}