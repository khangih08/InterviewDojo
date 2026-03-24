import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsOptional()
    @IsString()
    full_name?: string;
}