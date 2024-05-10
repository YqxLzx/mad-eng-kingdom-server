import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

interface Resemble {  
  dict: Array<unknown>; // 由于dict中包含Object，但没有具体结构，我们暂时使用unknown  
  synonyms: Array<string>;  
  description: string;  
}

@Entity("words")
export class Word {
  @PrimaryGeneratedColumn() 
  id: number; 

  @Column()  
  word: string; 

  @Column()  
  phonetic: string;  
  
  @Column()  
  definition: string;  
  
  @Column()  
  translation: string;

  @Column()  
  collins: number;  

  @Column()  
  oxford: number;  

  @Column()  
  tag: string;  

  @Column()  
  bnc: number; 
  
  @Column()  
  frq: number;  

  @Column()  
  exchange: string; 
  
  @Column()  
  entry: string;  

  @Column()  
  lemma: string;  

  @Column()  
  level: number;  

  @Column()  
  frequency: number;  

  @Column({ type: 'json' }) 
  resemble: Resemble;  

  @Column({type:'json', nullable: true }) 
  root?: JSON;
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
