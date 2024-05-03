import { IsOptional, IsString } from "class-validator"
export class AuthUserDto {
  @IsString()
  @IsOptional()
  readonly email: string

  @IsString()
  @IsOptional()
  readonly phone: string

  @IsString()
  readonly password: string
}
