import { Controller, Post, Body, Get, Param } from "@nestjs/common"
import { WordsService } from "./words.service"
import { Word } from "./word.entity"
import { Public } from "src/authGuard/publicAuth";

@Controller("words")
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post("mulAdd")
  async createWords(@Body() words: Word[]): Promise<any> {
    // 调用 WordsService 的 createWords 方法来处理批量新增
    return this.wordsService.createWords(words)
  }

  @Public()
  @Get('by-word/:word')  
  async findByWord(@Param('word') word: string): Promise<any> {  
    const result = await this.wordsService.findByWord(word);  
    return result;  
  }  
}
