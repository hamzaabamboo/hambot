import { Module } from '@nestjs/common';
import { RssService } from './rss.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [RssService],
  imports: [HttpModule],
  exports: [RssService],
})
export class RssModule {}
