import { IsString, IsInt, IsEnum, IsOptional } from "class-validator"

export class CreateUserDto {
  @IsString()
  readonly password: string

  @IsEnum(["Female", "Male", undefined])
  readonly sex: "Female" | "Male" | undefined

  @IsString()
  @IsOptional()
  readonly email?: string

  @IsString()
  @IsOptional()
  readonly phone?: string

  @IsString()
  @IsOptional()
  readonly name?: string
}
