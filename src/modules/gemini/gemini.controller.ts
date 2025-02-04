import {
  Body,
  Controller,
  Post,
  Response,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  MemoryStorageFile,
  UploadedFiles,
} from '@blazity/nest-file-fastify';

@Controller('gemini')
export class GeminiController {
  @Post('/')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'file',
      },
    ]),
  )
  async extractReceipt(
    @Body() fromData: never,
    @UploadedFiles() files: { file: MemoryStorageFile },
  ) {
    return files.file;
  }
}
