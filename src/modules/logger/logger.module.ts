import { Module } from '@nestjs/common';
import { AppLogger } from './logger';

@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
