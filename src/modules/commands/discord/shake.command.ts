import { Injectable } from '@nestjs/common';
import { Message, DiscordMessage } from '../../messages/messages.model';
import { BaseCommand } from '../command.base';
import { DiscordService } from 'src/modules/discord/discord.service';
import { TextChannel } from 'discord.js';
import { matchUser } from 'src/modules/discord/discord.utils';
import { sleep } from 'src/utils/sleep';

@Injectable()
export class ShakeCommand extends BaseCommand {
  public command = /^shake(?: ([^\s]*)(?: (\d+)(?: (\d+)(?: (\d+)?))?)?)?/i;
  public platforms = ['discord'];

  constructor(private discord: DiscordService) {
    super();
  }
  async handle(message: DiscordMessage, command: string, intensity = '10') {
    const guild = (message.messageChannel as TextChannel).guild;
    const channels = guild.channels.cache
      .filter(
        c =>
          c.type === 'voice' &&
          c.permissionsFor(this.discord.getClient.user).has('MOVE_MEMBERS') &&
          !c.permissionsLocked &&
          c.id !== guild.afkChannelID,
      )
      .array();
    switch (command) {
      case 'list':
        return {
          files: [],
          message: channels.map(c => `${c.id} - ${c.name}`).join('\n'),
        };
      default:
        const userId = matchUser(command);
        if (!userId) {
          return {
            files: [],
            message: `User not found`,
          };
        }
        const user = await guild.members.fetch(userId);
        if (!user.voice?.channelID)
          return {
            files: [],
            message: `${command} is not in a voice channel!`,
          };
        const origin = user.voice.channel;
        const I =
          isNaN(Number(intensity)) ||
          Number(intensity) < 0 ||
          Number(intensity) > 10
            ? 2
            : Math.round(Number(intensity));
        try {
          for (let i = 0; i < I; i++) {
            await user.voice.setChannel(
              channels[i % channels.length],
              'you got shaken',
            );
            await sleep(2000 / I);
          }
          await user.voice.setChannel(origin, 'you got shaken');
          return {
            files: [],
            message: `<@!${message.senderId}> shook ${command} ${I} times`,
          };
        } catch (error) {
          return {
            files: [],
            message: `I think ${command} escaped or something just went wrong (tried to shake ${I} times)`,
          };
        }
    }
  }
}
