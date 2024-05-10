import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { searchWord } from 'ecdict';
import * as fs from 'fs';
import * as path from 'path';
import { Word } from 'src/words/word.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class FileService implements OnApplicationBootstrap {
  private wordQueue: string[] = []; // 单词队列
  private isReading: boolean = false; // 是否正在读取

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async onApplicationBootstrap() {
    await this.copyPublicFileToDist();
  }

  async createWords(word: string) {
    const res = searchWord(word, {
      withResemble: true,
      withRoot: true,
      caseInsensitive: true,
    });

    if (res.word) {
      const wordEntity = this.entityManager.create(Word, {
        ...res,
        resemble: res.resemble || {},
      });
      const savedWords = await this.entityManager.save(wordEntity);
      console.log('Word saved:', savedWords.word);
      return savedWords;
    } else {
      return { error: `${word} not found`, code: 404, message: 'word not found' };
    }
  }

  copyPublicFileToDist() {
    const source = path.resolve('public', '8000wordList.txt');
    const destination = path.resolve(__dirname, '..', '..', 'public', '8000wordList.txt');

    if (!fs.existsSync(path.dirname(destination))) {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
    }
    fs.copyFileSync(source, destination);
    this.readPublicFile('8000wordList.txt');
  }

  readPublicFile(filePath) {
    const absolutePath = path.resolve(__dirname, '..', '..', 'public', filePath);

    // 将文件内容逐行添加到单词队列中
    const addWordsToQueue = (data: string) => {
      const lines = data.trim().split('\n');
      this.wordQueue.push(...lines.map(line => line.split('\t')[0])); // 提取单词并添加到队列中
    };

    // 读取文件内容并添加到队列中
    fs.readFile(absolutePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }
      addWordsToQueue(data);

      // 如果当前没有在读取，并且队列中有单词，则开始逐个处理单词
      if (!this.isReading && this.wordQueue.length > 0) {
        this.processWords();
      }
    });
  }

  processWords() {
    this.isReading = true;
    const word = this.wordQueue.shift(); // 从队列中取出一个单词
    if (word) {
      this.createWords(word)
        .then(() => {
          // 继续处理下一个单词
          if (this.wordQueue.length > 0) {
            setTimeout(() => this.processWords(), 5000); // 等待5秒后继续处理下一个单词
          } else {
            this.isReading = false; // 队列为空时，结束处理
          }
        })
        .catch(error => {
          console.error('Error processing word:', error);
          this.isReading = false; // 出错时，结束处理
        });
    } else {
      this.isReading = false; // 队列为空时，结束处理
    }
  }
}
