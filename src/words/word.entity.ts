import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

interface Meta {}

@Entity("wn_synset")




export class Word {
  @PrimaryGeneratedColumn()
  synset_id:number
  
  @Column()
  w_num:number

  @Column()
  word:string
  
  @Column()
  ss_type:string
  
  @Column()
  sense_number:number
  
  @Column()
  tag_count:number
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