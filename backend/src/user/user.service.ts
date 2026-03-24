import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from "./dto/user-response.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { use } from "passport";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Injectable()
export class UsersService {
    private readonly SALT_ROUND = 10;
    constructor(
        @InjectRepository(User) 
        private userRepository: Repository<User>,
    ) {}

    async findOneById(userId: string) {
        const user = await this.userRepository.findOne({
            where: {id: userId},
            select: {
                id: true,
                email: true,
                full_name: true,
                target_role: true,
                experience_level: true,
                role: true,
                password: false,
            },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findAll(): Promise<UserResponseDto[]>{
        return await this.userRepository.find({
            select: {
                id: true,
                email: true,
                full_name: true,
                target_role: true,
                experience_level: true,
                role: true,
                password: false,
            },
        });
    }

    async update(userId: string, updateUserDto: UpdateUserDto,): Promise<UserResponseDto> {
        const existingUser = await this.userRepository.findOne({
            where: {id: userId},
        });

        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
            const emailToken = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (emailToken) {
                throw new NotFoundException('Email is already taken');
            }
        }

        // Update user profile
        await this.userRepository.update(userId, updateUserDto);
        const updatedUser = await this.userRepository.findOne({
            where: {id: userId },
            select: {
                id: true,
                email: true,
                full_name: true,
                target_role: true,
                experience_level: true,
                role: true,
            },
      });
      
      if (!updatedUser) {
        throw new NotFoundException('Update failed: User not found after saving')};
        
        return updatedUser;
    }

    async changePassword(
        userId: string,
        changePasswordDto: ChangePasswordDto,
    ): Promise<{ message: string }> {
        const { currentPassword, newPassword } = changePasswordDto;
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new NotFoundException('Current password is incorrect');
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new NotFoundException(
        'New password must be different from the current password',
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, this.SALT_ROUND);

    await this.userRepository.update(
      userId ,
      { password: hashedNewPassword }
    );
    
    return { message: 'Password changed successfully' };
}

    async remove(userId: string): Promise<{ message: string}> {
        const user = await this.userRepository.findOne({
            where: { id: userId},
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.userRepository.delete(userId);

        return {
            message: 'User account deleted successfully'
        };
    }

}
