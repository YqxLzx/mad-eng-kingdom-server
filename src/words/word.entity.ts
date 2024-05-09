import { Entity, PrimaryColumn, Column } from "typeorm"

interface Meta {}

@Entity("wn_synset")
export class Word {
  // 第一个复合主键字段
  @PrimaryColumn({
    type: "decimal",
    precision: 10,
    scale: 0,

    name: "synset_id", // 数据库中的列名
  })
  synset_id: number

  // 第二个复合主键字段
  @PrimaryColumn({
    type: "decimal",
    precision: 10,
    scale: 0,

    name: "w_num", // 数据库中的列名
  })
  w_num: number

  @Column()
  word: string

  @Column({
    type: "char",
    length: 2, // 字符长度
  })
  ss_type: string

  @Column({
    type: "decimal",
    precision: 10,
    scale: 0,
  })
  sense_number: number

  @Column({
    type: "decimal",
    precision: 10,
    scale: 0,
  })
  tag_count: number
}

/* export class Word {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  word: string

  @Column()
  type: string

  @Column()
  zh: string

  @Column("json", { nullable: true })
  meta: Meta | null

  @Column()
  examples: string

  @Column()
  definition: string

  @Column()
  pronunciation: string

}
 */
