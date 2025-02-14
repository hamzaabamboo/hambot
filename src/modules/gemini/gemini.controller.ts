import {
  FileFieldsInterceptor,
  MemoryStorageFile,
  UploadedFiles,
} from '@blazity/nest-file-fastify';
import { GoogleGenerativeAIError } from '@google/generative-ai';
import {
  Controller,
  Header,
  InternalServerErrorException,
  Post,
  Req,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AppConfigService } from 'src/config/app-config.service';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(
    private gemini: GeminiService,
    private config: AppConfigService,
  ) {}

  @Post('/')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'files[]',
        maxCount: 20,
      },
    ]),
  )
  @Header('content-type', 'application/json')
  async extractReceipt(
    @Req() req: FastifyRequest,
    @UploadedFiles() files: { ['files[]']: MemoryStorageFile[] },
  ) {
    if (
      req.headers['x-hambot-key'] !== this.config.HAMBOT_KEY &&
      req.headers['x-gemini-secret'] !== this.config.GEMINI_SECRET
    ) {
      throw new UnauthorizedException('Not Authorized');
    }

    try {
      const res = [];
      for (let f of files['files[]']) {
        res.push(await this.gemini.readReceipt(f.buffer, f.mimetype));
      }
      return res;
    } catch (error: any) {
      if (error instanceof GoogleGenerativeAIError) {
        throw new InternalServerErrorException(error.message);
      } else throw error;
    }
  }
}
