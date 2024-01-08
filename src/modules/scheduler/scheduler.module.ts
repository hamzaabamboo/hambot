import { Module } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { IcalModule } from '../ical/ical.module';
import { LoggerModule } from '../logger/logger.module';
import { OutlineModule } from '../outline/outline.module';
import { PushModule } from '../push/push.module';
import { TrelloModule } from '../trello/trello.module';
import { CalendarSchedule } from './calendar.service';
import { FileSchedule } from './file.schedule';
import { RecurringService } from './recurring.service';
import { TaskSchedule } from './tasks.service';

@Module({
  imports: [LoggerModule, TrelloModule, PushModule, IcalModule, OutlineModule],
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
