import { Controller, Get } from "@nestjs/common"
import { FileService } from "./file.service"

@Controller("files")
export class FileController {
  constructor(private readonly fileService: FileService) {} // 注入 FileService

  @Get("copy")
  copyFileToDist() {
    this.fileService.copyPublicFileToDist() // 调用 FileService 中的方法
    return "File copied to dist"
  }
}
