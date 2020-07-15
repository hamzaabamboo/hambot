import { Module } from '@nestjs/common';
import { TrelloService } from './trello.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [TrelloService],
  imports: [ConfigModule],
  exports: [TrelloService],
})
export class TrelloModule {}
