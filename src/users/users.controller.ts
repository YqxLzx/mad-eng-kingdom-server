import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  ParseIntPipe,
  Put,
  ValidationPipe,
  UseGuards,
  Query,
} from "@nestjs/common"
import { UsersService } from "./users.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { Public } from "src/authGuard/publicAuth"
import { JwtAuthGuard } from "src/authGuard/jwt.auth.guard"
import { AuthUserDto } from "./dto/auth-user.dto"

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Public()
  @Get()
  getAllUser() {
    return this.usersService.getAllUser()
  }
  @Get("/users/:id")
  getUserById(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getUserById(id)
  }
  @Put()
  updateById(@Body() user) {
    return this.usersService.updateById(user)
  }

  @Public()
  @Post("/login")
  login(@Body(ValidationPipe) user: AuthUserDto) {
    return this.usersService.login(user)
  }

  @Public()
  @Post("/register")
  create(@Body(ValidationPipe) user: CreateUserDto) {
    return this.usersService.create(user)
  }

  @Delete(":account")
  delete(@Param("account") account: string) {
    return this.usersService.delete(account)
  }

  @Public()
  @Get("verifyCode")
  verifyCode(
    @Query("account") emialOrPhone: string,
    @Query("code") code: string,
  ) {
    return this.usersService.verifyCode(emialOrPhone, code)
  }

  @Public()
  @Post("resetPassword")
  resetPassword(
    @Body() body: { newPassword: string; rePassword: string; account: string },
  ) {
    const { newPassword, rePassword, account } = body
    return this.usersService.resetPassword(newPassword, rePassword, account)
  }

  @Delete()
  deleteAll() {
    return this.usersService.deleteAll()
  }
}
