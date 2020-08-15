import { Module, HttpModule } from '@nestjs/common';
import { RssService } from './rss.service';

@Module({
  providers: [RssService],
  imports: [HttpModule],
  exports: [RssService],
})
export class RssModule {}
