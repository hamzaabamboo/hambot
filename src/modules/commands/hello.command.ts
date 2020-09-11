import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';

@Injectable()
export class HelloCommand extends BaseCommand {
  public command = /^(hello|hi)/i;

  async handle(message: Message) {
    return {
      files: [],
      message: 'Hello World',
    };
  }
}
