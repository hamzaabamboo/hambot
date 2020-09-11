import { Injectable } from '@nestjs/common';
import { BaseCommand } from '../command.base';
import { Message } from '../../messages/messages.model';

@Injectable()
export class BaseDiscordCommand extends BaseCommand {
  public command = /^(dping)/i;
  public channels = ['discord'];

  async handle(message: Message) {
    return {
      files: [],
      message: 'Hello Discord!',
    };
  }
}
