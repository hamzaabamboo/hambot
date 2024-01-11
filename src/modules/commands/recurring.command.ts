import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import { RecurringService } from '../scheduler/recurring.service';
import { parseExpression } from 'cron-parser';
import moment from 'moment';
@Injectable()
export class RecurringCommand extends BaseCommand {
  public name = 'recurring';
  public command = /^recurring(?: (stop|refresh|list))?/i;
  public requiresAuth = true;
  constructor(private recurring: RecurringService) {
    super();
  }

  async handle(message: Message, command: string) {
    switch (command) {
      case 'stop':
        await this.recurring.clearEvents();
        return {
          files: [],
          message: 'Stopped all recurring Events',
        };
      case 'refresh':
        await this.recurring.refresh();
        return {
          files: [],
          message: 'Refreshed all recurring Events',
        };
      case 'list':
        const events = await this.recurring.getRecurringEvents();
        const eventWithNextDate = events
          .map((e) => {
            let nextDate: Date;
            try {
              nextDate = parseExpression(e.cronTab).next().toDate();
            } catch {}
            return { ...e, nextDate };
          })
          .sort((b, a) =>
            moment(a.nextDate).isBefore(moment(b.nextDate)) ? 1 : -1,
          );

        return {
          files: [],
          message: `Recurring events:
${eventWithNextDate
  .map(
    (e) =>
      `- ${e.card} [${e.cronTab.replaceAll('*', '\\*')}] <${e.tags}>${
        e.nextDate ? `\n  - ${moment(e.nextDate).format('ddd, MMM D')}` : ``
      }`,
  )
  .join('\n')}
          `,
        };
      default:
        return {
          files: [],
          message: 'Usage: recurring <stop/refresh>',
        };
    }
  }
}
