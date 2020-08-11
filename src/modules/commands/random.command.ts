import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import { clone } from 'lodash';

@Injectable()
export class RandomCommand extends BaseCommand {
  public command = /^random(?:(?: (group))?(?: (\d+))?(?: (.*))?)?/i;

  async handle(message: Message, command: string, n = '2', things: string) {
    const stuff = things.split(' ');
    switch (command) {
      case 'group':
        const groups = Array(isNaN(Number(n)) ? 2 : Number(n))
          .fill(undefined)
          .map(_ => []);
        const arr: string[] = clone(stuff);
        let i = 0;
        while (arr.length > 0) {
          const idx = Math.floor(Math.random() * arr.length);
          groups[i].push(arr.splice(idx, 1)[0]);
          i = (i + 1) % groups.length;
        }
        return {
          ...message,
          files: [],
          message: groups
            .map((e, i) => `Group ${i + 1}\n ${e.join(' ,')}`)
            .join('\n'),
        };
      default:
        return {
          ...message,
          files: [],
          message: stuff[Math.floor(Math.random() * stuff.length)],
        };
    }
  }
}
