import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import * as moment from 'moment';

@Injectable()
export class TimeCommand extends BaseCommand {
  public command = /^(time)/i;

  async handle(message: Message) {
    return {
      ...message,
      message: moment().format('DD/MM/YYYY HH:mm'),
    };
  }
}
