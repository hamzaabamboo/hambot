import { Module } from '@nestjs/common';
import { FileSchedule } from './file.schedule';
import { LoggerModule } from '../logger/logger.module';
import { TrelloModule } from '../trello/trello.module';
import { RecurringService } from './recurring.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PushModule } from '../push/push.module';
import { TaskSchedule } from './tasks.service';
import { CalendarSchedule } from './calendar.service';
import { IcalModule } from '../ical/ical.module';

@Module({
  imports: [LoggerModule, TrelloModule, PushModule, IcalModule],
  providers: [
    FileSchedule,
    RecurringService,
    SchedulerRegistry,
    TaskSchedule,
    CalendarSchedule,
  ],
  exports: [RecurringService],
})
export class SchedulerModule {}
