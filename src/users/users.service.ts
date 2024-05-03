import { CreateUserDto } from "./dto/create-user.dto"
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { DeleteResult, Repository } from "typeorm"
import { Users } from "./users.entity"
import { JwtService } from "@nestjs/jwt"
import { AuthUserDto } from "./dto/auth-user.dto"
import { checkEmailOrphone } from "src/utils"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private jwtService: JwtService,
  ) {}
  getAllUser() {
    return this.userRepository.find()
  }
  getUserById(id: number) {
    return this.userRepository.findOneBy({ id })
  }
  async create(createUserDto: CreateUserDto): Promise<Users> {
    const { phone, email, password } = createUserDto
    const conditions: any[] = []
    if (phone) {
      conditions.push({ phone })
    }

    if (email) {
      conditions.push({ email })
    }

    if (!password) {
      throw new NotFoundException("Password is required")
    }
    const result = await this.userRepository.findOne({
      where: conditions.length > 1 ? conditions : conditions[0],
    })

    if (result) {
      throw new NotFoundException("User already exists")
    }
    const newUserInfo = {
      access_token: this.jwtService.sign({ phone, email, password }),
      account: createUserDto.phone || createUserDto.email,
      password: createUserDto.password,
      email: createUserDto.email,
      phone: createUserDto.phone,
      name: createUserDto.name,
      avatar: "",
      sex: "",
      wechat: "",
      ip: "",
      role: "",
      describe: "这个人很懒，什么都没留下...QVQ",
    }
    const newUser = this.userRepository.create(newUserInfo)
    this.userRepository.save(newUser)
    return newUserInfo
  }
  async login(user: AuthUserDto): Promise<{ access_token: string } & Users> {
    const { email, phone, password } = user
    if (!email && !phone) {
      throw new NotFoundException("Please provide email, or phone")
    }
    const conditions: any = {}
    if (email) conditions.email = email
    if (phone) conditions.phone = phone

    // Find user based on any of the provided identifiers
    const result = await this.userRepository.findOne({ where: conditions })

    if (!result) {
      throw new NotFoundException("User not found")
    }

    // Check password
    if (password !== result.password) {
      throw new UnauthorizedException("Invalid password")
    }

    // Remove sensitive information before generating token
    const { password: userPassword, ...payload } = result

    // Generate and return access token
    return {
      access_token: this.jwtService.sign(payload),
      ...result,
    }
  }
  async updateById(user: Users): Promise<Users> {
    const { email, phone } = user
    if (!email && !phone) {
      throw new NotFoundException("Please provide email, or phone")
    }
    let result
    if (email) {
      result = await this.userRepository.update({ email: email }, user)
      if (result.affected === 0) {
        throw new NotFoundException(`User with ID "${email}" not found`)
      } else {
        return this.userRepository.findOneBy({ email: email })
      }
    } else if (phone) {
      result = await this.userRepository.update({ phone: phone }, user)
      if (result.affected === 0) {
        throw new NotFoundException(`User with ID "${phone}" not found`)
      } else {
        console.log(result)
        return this.userRepository.findOneBy({ phone: phone })
      }
    }
  }
  async delete(account: string): Promise<DeleteResult> {
    const reg_emial = /\S+@\S+\.\S+/
    const reg_phone = /^1[3456789]\d{9}$/
    if (reg_emial.test(account)) {
      const res = await this.userRepository.delete({ email: account })
      return res
    } else if (reg_phone.test(account)) {
      const res = await this.userRepository.delete({ phone: account })
      return res
    }
  }

  async verifyCode(emailOrPhone: string, code: string) {
    // 123456 is the temporary verification code
    if (code === "123456") {
      const user = await this.findByEmailOrPhone(emailOrPhone) // Call the function to find user by email or phone
      if (!user) {
        throw new NotFoundException("Account not found")
      } else {
        return {} // Return whatever response you need here
      }
    } else {
      throw new NotFoundException("Account Or Code Error")
    }
  }

  async findByEmailOrPhone(emailOrPhone: string): Promise<Users> {
    // Check if the input is a valid email
    const isEmail = /\S+@\S+\.\S+/
    let query: any = {}
    if (isEmail.test(emailOrPhone)) {
      query = { email: emailOrPhone }
    } else {
      query = { phone: emailOrPhone }
    }
    return this.userRepository.findOne({ where: query })
  }

  async resetPassword(
    newPassword: string,
    rePassword: string,
    account: string,
  ): Promise<Users> {
    if (newPassword !== rePassword) {
      throw new NotFoundException("Password inconsistency")
    }
    const accountValue = checkEmailOrphone(account)
    if (accountValue === "email") {
      const result = await this.userRepository.findOneBy({ email: account })
      if (!result) {
        throw new NotFoundException("User not found")
      } else {
        result.password = newPassword
        this.userRepository.save(result)
      }
      return result
    } else if (accountValue === "phone") {
      const result = await this.userRepository.findOneBy({ phone: account })
      if (!result) {
        throw new NotFoundException("User not found")
      } else {
        result.password = newPassword
        this.userRepository.save(result)
      }
      return result
    } else {
      throw new NotFoundException("Account not found")
    }
  }

  async deleteAll(): Promise<void> {
    await this.userRepository.clear()
  }
}
