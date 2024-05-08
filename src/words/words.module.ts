import { Module } from "@nestjs/common"
import { WordsController } from "./words.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { WordsService } from "./words.service"

import { Word } from "./word.entity"

@Module({
  controllers: [WordsController],
  imports: [TypeOrmModule.forFeature([Word])],
  providers: [WordsService],
})
export class WordsModule {}
