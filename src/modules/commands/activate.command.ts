import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class ActivateCommand extends BaseCommand {
  public command = /^(activate|deactivate)(?: (.*))?/i;
  public requiresAuth = true;

  constructor(private discordService: DiscordService) {
    super();
  }

  async handle(message: Message, command: string, service: string) {
    switch (command) {
      case 'activate':
        switch (service) {
          case 'discord':
            this.discordService.toggleDiscord(false);
            return {
              files: [],
              message: 'Activated Discord',
            };
        }
      case 'deactivate':
        switch (service) {
          case 'discord':
            this.discordService.toggleDiscord(true);
            return {
              files: [],
              message: 'Deactivated Discord',
            };
        }
      default:
        return {
          files: [],
          message: 'Usage : activate/deactivate service',
        };
    }
  }
}
