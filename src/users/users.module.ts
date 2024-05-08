import { Module } from "@nestjs/common"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Users } from "./users.entity" // 引入你的 User 实体
import { JwtModule } from "@nestjs/jwt"
@Module({
  imports: [
    TypeOrmModule.forFeature([Users]), // 导入并为 User 实体提供存储库
    JwtModule.register({
      secret: "lzxlzx", // replace with your secret key
      signOptions: { expiresIn: "60m" }, // adjust as needed
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
