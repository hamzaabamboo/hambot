import { Injectable } from '@nestjs/common';
import { Message } from '../messages/messages.model';

@Injectable()
export class BaseCommand {
  public name: string;
  public command = /(.*?)/;
  public requiresAuth = false;
  public channels: string[] | undefined;

  matchInput(input: string): boolean {
    return this.command.test(input);
  }

  getParams(input: string): string[] {
    const match = this.command.exec(input);
    return match;
  }

  handleInput(message: Message) {
    const params = this.getParams(message.message).slice(1) ?? [];
    return this.handle(message, ...params);
  }

  async handle(
    message: Message,
    ...params: string[]
  ): Promise<Partial<Message> | undefined> {
    // Do nothing
    return {
      files: [],
      message: 'Command not found sry :P' + params.map(() => '').join(''),
    };
  }
}
