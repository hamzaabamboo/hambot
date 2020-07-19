import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';

@Module({
  providers: [AudioService],
  exports: [AudioService],
})
export class AudioModule {}
