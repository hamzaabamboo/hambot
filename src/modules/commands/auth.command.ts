import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthCommand extends BaseCommand {
  public command = /^auth(?: (token|register)(?: (.*))?)?/i;

  constructor(private auth: AuthService) {
    super();
  }

  async handle(message: Message, command: string, token: string) {
    switch (command) {
      case 'token':
        if (!token)
          return {
            ...message,
            message: 'Please supply token use: auth token <token>',
          };
        if (
          await this.auth.register(message.senderId, message.channel, token)
        ) {
          return {
            ...message,
            message: 'Registration successful',
          };
        } else {
          return {
            ...message,
            message: 'Invalid Token',
          };
        }
      case 'register':
        console.log(
          'Generate token for ',
          message.senderId,
          ' : ',
          this.auth.getToken(message.senderId, message.channel),
        );
        return {
          ...message,
          message: 'Please check token in console and use : auth token <token>',
        };
      default:
        return {
          ...message,
          message: 'Usage : auth <token/register>',
        };
    }
  }
}
