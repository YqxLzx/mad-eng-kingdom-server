// user.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm"

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

  @Column({
    nullable: true,
    type: "text",
  })
  avatar: string

  @CreateDateColumn()
  createdTime?: Date
}
