import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';

@Injectable()
export class PingCommand extends BaseCommand {
  public name = 'ping';
  public command = /^(ping|pong|echo)(?: (.*))?/i;

  async handle(message: Message, type: string, msg?: string) {
    let res = 'Something wrong';
    switch (type) {
      case 'ping':
        res = 'pong';
        break;
      case 'pong':
        res = 'ping';
        break;
      case 'echo':
        if (msg) {
          res = msg;
        } else {
          res = 'Usage: echo <message>';
        }
        break;
    }
    return {
      files: [],
      message: res,
    };
  }
}
