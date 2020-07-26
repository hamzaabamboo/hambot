import { Module } from '@nestjs/common';
import { FileSchedule } from './file.schedule';
import { LoggerModule } from '../logger/logger.module';
import { TrelloModule } from '../trello/trello.module';
import { RecurringService } from './recurring.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PushModule } from '../push/push.module';

@Module({
  imports: [LoggerModule, TrelloModule, PushModule],
  providers: [FileSchedule, RecurringService, SchedulerRegistry],
})
export class SchedulerModule {}
