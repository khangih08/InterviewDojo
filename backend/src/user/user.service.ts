import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) 
        private userRepository: Repository<User>,
    ) {}

    async create(data: any) {
        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(data.password, salt);
        const newUser = this.userRepository.create({
            ...data,
            password: hashedPassword,
        });
        return this.userRepository.save(newUser);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOneBy({ email });
    }

    findOne(id: number) {
        return this.userRepository.findOneBy({ id: String(id) });
    }

    async update(id: number, data: any) {
        if (data.password) {
            const salt = await bcrypt.genSalt(8);
            data.password = await bcrypt.hash(data.password, salt);
        }
        await this.userRepository.update(id, data);
        return this.findOne(id);
    }

    remove(id: number) {
        return this.userRepository.delete(id);
    }

}
