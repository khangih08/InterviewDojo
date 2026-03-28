import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { UserResponseDto } from "./dto/user-response.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
export declare class UsersService {
    private userRepository;
    private readonly SALT_ROUND;
    constructor(userRepository: Repository<User>);
    findOneById(userId: string): Promise<User>;
    findAll(): Promise<UserResponseDto[]>;
    update(userId: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    remove(userId: string): Promise<{
        message: string;
    }>;
}
