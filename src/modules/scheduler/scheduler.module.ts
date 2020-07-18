import { Module } from '@nestjs/common';
import { FileSchedule } from './file.schedule';
import { LoggerModule } from '../logger/logger.module';
import { TrelloModule } from '../trello/trello.module';

@Module({
  imports: [LoggerModule, TrelloModule],
  providers: [FileSchedule],
})
export class SchedulerModule {}
