import { Injectable } from "@nestjs/common";
import { UserService } from "../../user/user.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private userService: UserService) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const { password, ...result } = user;
                return result;
            }
        }
        return null;
    }
}