// user.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm"

interface IUserItem {
  name: string
  sex: string   
}

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({
    nullable: true,
  })
  name: string

  @Column({
    nullable: true,
  })
  sex: string

  @Column()
  password: string

  @Column({
    nullable: true,
  })
  email: string

  @Column({
    nullable: true,
  })
  wechat: string

  @Column({
    nullable: true,
  })
  ip: string

  @Column({
    nullable: true,
  })
  role: string

  @Column()
  account: string

  @Column({
    nullable: true,
  })
  phone: string

  @Column({
    nullable: true,
  })
  describe: string

  @Column({ nullable: true, type: "json" }) // 设置为 JSON 类型
  rank: { type: string; top: number }[] // 定义数组元素结构

  @Column({ nullable: true, type: "json" })
  friends: {
    following?: {
      count: number
      list: IUserItem[]
    }
    follower?: {
      count: number
      list: IUserItem[]
    }
    blockList?: {
      count: number
      list: IUserItem[]
    }
  }

  @Column({
    nullable: true,
    type: "text",
  })
  avatar: string

  @CreateDateColumn()
  createdTime?: Date
}
