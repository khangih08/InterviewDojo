import { UserResponseDto } from "./dto/user-response.dto";
import { UsersService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { RequestWithUser } from "src/common/interface/request-with-user.interface";
import { ChangePasswordDto } from "./dto/change-password.dto";
export declare class UserControllers {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: RequestWithUser): Promise<UserResponseDto>;
    findAll(): Promise<UserResponseDto[]>;
    findOne(id: string): Promise<UserResponseDto>;
    updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deleteAccount(userId: string): Promise<{
        message: string;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}
