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

  async getRandomWord(): Promise<Word> {
    const totalWords = await this.entityManager.count(Word)

    // 生成随机索引
    const randomIndex = Math.floor(Math.random() * totalWords)

    // 使用查询构造器获取随机单词
    const randomWord = await this.entityManager.findOne(Word, {
      where: { id: randomIndex },
    })

    return randomWord
  }

  async getAnyWords(count: number): Promise<Word[]> {
    const totalCount = await this.entityManager.count(Word)
    if (totalCount === 0 || count <= 0) {
      return [] // 如果数据库中没有任何 Word 实体，或者 count 小于等于 0，则返回空数组
    }

    const randomIds: number[] = []
    while (randomIds.length < count) {
      const randomId = Math.floor(Math.random() * totalCount)
      if (!randomIds.includes(randomId)) {
        randomIds.push(randomId)
      }
    }

    const randomWordsPromises: Promise<Word>[] = randomIds.map(async (id) => {
      return await this.entityManager.findOne(Word, { where: { id } })
    })

    const randomWords = await Promise.all(randomWordsPromises)
    return randomWords.filter(
      (word) => word !== undefined && word !== null,
    ) as Word[]
  }
}
