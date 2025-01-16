import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import { ABCFortuneService } from '../abc-fortune/abc-fortune.service';

@Injectable()
export class ABCFortuneCommand extends BaseCommand {
  public name = 'abc-fortune';
  public command = /^abc-fortune(?: (.*?))?$/i;
  public requiresAuth = true;

  constructor(private abcFortune: ABCFortuneService) {
    super();
  }

  async handle(message: Message, arg: string) {
    await this.abcFortune.getFortune();
    const url = `https://hambot.ham-san.net/abc-fortune?token=${this.abcFortune.getTodayHash()}`;
    return {
      files: [
        {
          name: `${this.abcFortune.getFilename()}`,
          url,
        },
      ],
      message: `Here is your fortune for today ${
        this.abcFortune.getFilename().split('.')[0]
      }`,
    };
  }
}
