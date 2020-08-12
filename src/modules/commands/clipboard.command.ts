import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';

@Injectable()
export class ClipboardCommand extends BaseCommand {
  public command = /^(c(?:opy)?|p(?:aste)?)(?: (.*))?/i;
  requiresAuth = true;
  clipboard: string;

  async handle(message: Message, command: string, things: string) {
    switch (command) {
      case 'c':
      case 'copy':
        this.clipboard = things;
        return {
          ...message,
          files: [],
          message: 'Copied',
        };
      case 'p':
      case 'paste':
        if (this.clipboard !== '') {
          return {
            ...message,
            files: [],
            message: this.clipboard,
          };
        } else {
          return {
            ...message,
            files: [],
            message: 'Clipboard empty',
          };
        }
    }
  }
}
