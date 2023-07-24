import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { DiscordService } from '../discord/discord.service';
import { Message } from '../messages/messages.model';
import { BaseCommand } from './command.base';

@Injectable()
export class ActivateCommand extends BaseCommand {
  public name = 'activate';
  public command = /^(activate|deactivate)(?: (.*))?/i;
  public requiresAuth = true;

  constructor(
    @Inject(forwardRef(() => DiscordService))
    private discordService: DiscordService,
  ) {
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
