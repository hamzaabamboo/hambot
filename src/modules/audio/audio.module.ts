import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';
// import { StreamService } from '../deprecated/stream/stream.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  providers: [AudioService, 
    // StreamService
  ],
  exports: [AudioService, 
    // StreamService
  ],
  imports: [LoggerModule],
})
export class AudioModule {}
