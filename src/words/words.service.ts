// src/words/words.service.ts
import { Injectable, Logger } from "@nestjs/common"
import { InjectEntityManager } from "@nestjs/typeorm"
import { EntityManager } from "typeorm"
import { Word } from "./word.entity"

@Injectable()
export class WordsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    // private readonly logger = new Logger(EntityManager.name)
  ) {}

  async createWords(word: string) {
    /* 
    const res = searchWord(word, {
      withResemble: true,
      withRoot: true,
      caseInsensitive: true,
    })

    if (res.word) {
      // 创建一个新的 Word 对象并映射属性  
      const wordEntity = this.entityManager.create(Word, {
        ...res, 
      });
      const savedWords = await this.entityManager.save(wordEntity)
      return savedWords
    } else {
      return { error: 'word not found', code: 404, message: 'word not found' }
    } */
  }

  async findByWord(word): Promise<Word[]> {
    //this.logger.error('findByWord', word)
    return await this.entityManager.find(Word, { where: { word } })
  }
}
