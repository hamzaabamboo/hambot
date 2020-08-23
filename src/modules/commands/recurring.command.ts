import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import { RecurringService } from '../scheduler/recurring.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class RecurringCommand extends BaseCommand {
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
                ...message,
                files: [],
                message: 'Stopped all recurring Events',
              };
        case 'refresh':
            await this.recurring.refresh();
            return {
                ...message,
                files: [],
                message: 'Refreshed all recurring Events',
              };
        default:
            return {
                ...message,
                files: [],
                message: "Usage: recurring <stop/refresh>"
              };
    }
  }
}
