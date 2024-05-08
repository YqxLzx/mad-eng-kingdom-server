import { Controller, Post, Body } from "@nestjs/common"
import { WordsService } from "./words.service"
import { Word } from "./word.entity"

@Controller("words")
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post("mulAdd")
  async createWords(@Body() words: Word[]): Promise<any> {
    // 调用 WordsService 的 createWords 方法来处理批量新增
    return this.wordsService.createWords(words)
  }
}
