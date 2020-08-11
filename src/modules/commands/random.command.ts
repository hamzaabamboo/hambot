import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import { clone, max } from 'lodash';

@Injectable()
export class RandomCommand extends BaseCommand {
  public command = /^random(?:(?: (group|weighted))?(?: (\d+))?(?: (.*))?)?/i;

  async handle(message: Message, command: string, n = '2', things: string) {
    const stuff = things.split(' ');
    const groups = Array(isNaN(Number(n)) || Number(n) < 1 ? 2 : Number(n))
      .fill(undefined)
      .map(_ => []);
    switch (command) {
      case 'group':
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
      case 'weighted':
        const names = stuff
          .map(e => e.split(':'))
          .map(([name, weight]) => ({
            name,
            weight: !isNaN(Number(weight)) ? Number(weight) : 1,
          }));
        const acc: { name: string; weight: number }[] = clone(names);
        let group = 0;
        while (acc.length > 0) {
          const toDel = acc.reduce(
            (p, c) =>
              p.weight * Math.random() > c.weight * Math.random() ? p : c,
            acc[0],
          );
          const idx = acc.findIndex(p => p.name === toDel.name);
          groups[group].push(acc.splice(idx, 1)[0].name);
          group = (group + 1) % groups.length;
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
