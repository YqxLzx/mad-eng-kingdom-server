import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from "@nestjs/typeorm"
import { Word } from 'src/words/word.entity';
import { WordsService } from 'src/words/words.service';


@Module({
  providers: [FileService,WordsService],
  imports: [TypeOrmModule.forFeature([Word])],
  controllers: [FileController]
})
export class FileModule {

}
