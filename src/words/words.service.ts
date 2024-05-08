// src/words/words.service.ts
import { Injectable } from "@nestjs/common"
import { InjectEntityManager } from "@nestjs/typeorm"
import { EntityManager } from "typeorm"
import { Word } from "./word.entity"


@Injectable()
export class WordsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async createWords(words: Word[]){
    const savedWords = await this.entityManager.insert(
      Word, // Add the entity class as the first argument
      words,
    )
    return savedWords
  }
}
