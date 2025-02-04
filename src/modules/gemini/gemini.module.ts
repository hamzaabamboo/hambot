import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';

@Module({
  providers: [GeminiService],
  controllers: [GeminiController],
  imports: [LoggerModule],
})
export class GeminiModule {}
