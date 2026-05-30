import { Body, Param, Req } from "@nestjs/common";
import { UserResponseDto } from "./dto/user-response.dto";
import { UsersService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { GetUser } from "src/common/decorator/get-user.decorator";
import { RequestWithUser } from "src/common/interface/request-with-user.interface";
import { ChangePasswordDto } from "./dto/change-password.dto";

export class UserControllers {
    constructor(private readonly usersService: UsersService) {}
    
    async getProfile(@Req() req: RequestWithUser): Promise<UserResponseDto> {
        return await this.usersService.findOneById(req.user.id);
    }

    // Get all users(for admin purposes)
    async findAll(): Promise<UserResponseDto[]> {
        return await this.usersService.findAll();
    }

    //Get user by ID (for admin)
    async findOne(@Param('id') id: string): Promise<UserResponseDto> {
        return await this.usersService.findOneById(id);
    }

    //Update current user profile
    async updateProfile(
        @GetUser('id') userId: string,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<UserResponseDto> {
        return await this.usersService.update(userId, updateUserDto)
    }

    async changePassword(
        @GetUser('id') userId: string,
        @Body() changePasswordDto: ChangePasswordDto,
    ): Promise<{ message: string }> {
        return await this.usersService.changePassword(userId, changePasswordDto);
    }

    //Delete current user account
    async deleteAccount(
        @GetUser('id') userId: string,
    ): Promise<{ message: string }> {
        return await this.usersService.remove(userId);
    }

    // Delete user by ID (for admin)
    async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
        return await this.usersService.remove(id);
    }
}