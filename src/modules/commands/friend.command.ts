import { Injectable } from '@nestjs/common';
import { Message } from '../messages/messages.model';
import { BaseCommand } from './command.base';

@Injectable()
export class FriendCommand extends BaseCommand {
  public command = /^(friend)/i;
  public quotes = [
    'ไม่ได้มึงนี่กูแย่เลย',
    'I am not a noodle guy',
    'Mr. Ham, I saw you at MBK. Are you still there?',
  ];

  async handle(message: Message) {
    return {
      files: [],
      message: this.quotes[Math.floor(Math.random() * this.quotes.length)],
    };
  }
}
