import { Injectable } from '@nestjs/common';
import { Message, DiscordMessage } from '../../messages/messages.model';
import { BaseCommand } from '../command.base';
import { DiscordService } from 'src/modules/discord/discord.service';
import { TextChannel } from 'discord.js';
import { matchUser } from 'src/modules/discord/discord.utils';

const sleep = duration => new Promise(resolve => setTimeout(resolve, duration));

@Injectable()
export class ShakeCommand extends BaseCommand {
  public command = /^shake(?: ([^\s]*)(?: (\d+)(?: (\d+)(?: (\d+)?))?)?)?/i;
  public platforms = ['discord'];

  constructor(private discord: DiscordService) {
    super();
  }
  async handle(
    message: DiscordMessage,
    command: string,
    intensity = '10',
  ): Promise<Message> {
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
          ...message,
          files: [],
          message: channels.map(c => `${c.id} - ${c.name}`).join('\n'),
        };
      default:
        const userId = matchUser(command);
        if (!userId) {
          return {
            ...message,
            files: [],
            message: `User not found`,
          };
        }
        const user = await guild.members.fetch(userId);
        if (!user.voice?.channelID)
          return {
            ...message,
            files: [],
            message: `${command} is not in a voice channel!`,
          };
        const origin = user.voice.channel;
        const I = isNaN(Number(intensity)) ? 2 : Number(intensity);
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
            ...message,
            files: [],
            message: `<@!${message.senderId}> shook ${command}`,
          };
        } catch (error) {
          return {
            ...message,
            files: [],
            message: `I think ${command} escaped or something just went wrong`,
          };
        }
    }
  }
}
