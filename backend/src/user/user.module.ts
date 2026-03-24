import { Module } from "@nestjs/common";
import { UsersService } from "./user.service";
import { UserControllers } from "src/user/user.controller";

@Module({
    controllers: [ UserControllers ],
    providers: [ UsersService ]
})
export class UsersModule {}