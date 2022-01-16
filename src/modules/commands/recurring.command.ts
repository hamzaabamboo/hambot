import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import { RecurringService } from '../scheduler/recurring.service';

@Injectable()
export class RecurringCommand extends BaseCommand {
  public name = 'recurring';
  public command = /^recurring(?: (stop|refresh))?/i;
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
      default:
        return {
          files: [],
          message: 'Usage: recurring <stop/refresh>',
        };
    }
  }
}
