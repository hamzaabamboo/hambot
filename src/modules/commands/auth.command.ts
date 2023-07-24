import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import { AuthService } from '../auth/auth.service';
import { AppLogger } from '../logger/logger';

@Injectable()
export class AuthCommand extends BaseCommand {
  public name = 'auth';
  public command = /^auth(?: (token|register)(?: (.*))?)?/i;

  constructor(
    private auth: AuthService,
    private logger: AppLogger,
  ) {
    super();
    this.logger.setContext('AuthCommand');
  }

  async handle(message: Message, command: string, token: string) {
    if (await this.auth.isAuthenticated(message.senderId, message.channel)) {
      return {
        files: [],
        message: 'You are already authenticated',
      };
    }
    switch (command) {
      case 'token':
        if (!token)
          return {
            files: [],
            message: 'Please supply token use: auth token <token>',
          };
        if (
          await this.auth.register(message.senderId, message.channel, token)
        ) {
          return {
            files: [],
            message: 'Registration successful',
          };
        } else {
          return {
            files: [],
            message: 'Invalid Token',
          };
        }
      case 'register':
        this.logger.verbose(
          `Token for ${message.senderId} (${
            message.channel
          }) : ${this.auth.getToken(message.senderId, message.channel)}`,
        );
        return {
          files: [],
          message: 'Please check token in console and use : auth token <token>',
        };
      default:
        return {
          files: [],
          message: 'Usage : auth <token/register>',
        };
    }
  }
}
