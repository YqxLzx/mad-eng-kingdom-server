import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

interface Resemble {
  dict: Array<unknown> // 由于dict中包含Object，但没有具体结构，我们暂时使用unknown
  synonyms: Array<string>
  description: string
}

@Entity("words")
export class Word {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  level: number

  @Column({ nullable: true })
  frequency: number

  @Column({ type: "json", nullable: true })
  root: any

  @Column()
  word: string

  @Column({ nullable: true, collation: "utf8mb4_0900_ai_ci" })
  phonetic: string

  @Column({ nullable: true })
  translation: string

  @Column({ nullable: true })
  collins: number

  @Column({ nullable: true })
  oxford: number

  @Column({ nullable: true, collation: "utf8mb4_0900_ai_ci" })
  tag: string

  @Column({ nullable: true })
  bnc: number

  @Column({ nullable: true })
  frq: number

  @Column({ nullable: true, collation: "utf8mb4_0900_ai_ci" })
  exchange: string

  @Column({ nullable: true, collation: "utf8mb4_0900_ai_ci" })
  entry: string

  @Column({ nullable: true, collation: "utf8mb4_0900_ai_ci" })
  lemma: string

  @Column({ type: "json", nullable: true })
  resemble: Resemble

  @Column({ type: "text", nullable: true, collation: "utf8mb4_0900_ai_ci" })
  definition: string
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
