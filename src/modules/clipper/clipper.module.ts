import { Module } from '@nestjs/common';
import { ClipperController } from './clipper.controller';
import { ClipperService } from './clipper.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  controllers: [ClipperController],
  providers: [ClipperService],
  imports: [LoggerModule],
})
export class ClipperModule {}
