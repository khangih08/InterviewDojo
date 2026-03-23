import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
export declare class UserService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    create(data: any): Promise<User[]>;
    findByEmail(email: string): Promise<User | null>;
    findOne(id: number): Promise<User | null>;
    update(id: number, data: any): Promise<User | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
