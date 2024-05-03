import { IsArray } from "class-validator"

export class DeleteUserDto {
  @IsArray()
  accounts: string[]
}
