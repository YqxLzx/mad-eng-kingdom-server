import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

interface Meta {}

@Entity("dictionary")
export class Word {
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

/*   @Column("text", { array: true })
  synonyms: string[]

  @Column("text", { array: true })
  antonyms: string[] */
}
