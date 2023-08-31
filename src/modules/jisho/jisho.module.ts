import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { JishoController } from './jisho.controller';
import { JishoService } from './jisho.service';

@Module({
  controllers: [JishoController],
  providers: [JishoService],
  imports: [HttpModule, LoggerModule]
})
export class JishoModule {}
