import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { OutlineService } from './outline.service';

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [OutlineService],
  exports: [OutlineService],
})
export class OutlineModule {}
