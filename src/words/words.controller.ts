import { Controller, Post, Body, Get, Param, Query } from "@nestjs/common"
import { WordsService } from "./words.service"
import { Word } from "./word.entity"
import { Public } from "src/authGuard/publicAuth"

@Controller("words")
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Public()
  @Post("addWord")
  async createWords(@Body("word") word: string) {
    // 调用 WordsService 的 createWords 方法来处理批量新增
    return this.wordsService.createWords(word)
  }

  @Public()
  @Get("by-word/:word")
  async findByWord(@Param("word") word: string): Promise<Word[]> {
    const result = await this.wordsService.findByWord(word)
    return result
  }

  @Public()
  @Get("getAnyWords")
  async getAnyWords(@Query("count") count: number): Promise<Word[]> {
    return this.wordsService.getAnyWords(count)
  }

  @Public()
  @Get("getOneRandomWord")
  async getRandomWord(): Promise<Word> {
    return this.wordsService.getRandomWord()
  }
}
