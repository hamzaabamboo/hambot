import { Injectable } from '@nestjs/common';
import { Message, DiscordMessage } from '../../messages/messages.model';
import { BaseCommand } from '../command.base';
import { DiscordService } from 'src/modules/discord/discord.service';
import { TextChannel, VoiceChannel } from 'discord.js';
import { matchUser } from 'src/modules/discord/discord.utils';
import { sleep } from 'src/utils/sleep';

@Injectable()
export class ShakeCommand extends BaseCommand {
  public name = "shake";
  public command = /^shake(?: ([^\s]*)(?: (\d+)(?: (\d+)(?: (\d+)?))?)?)?/i;
  public platforms = ['discord'];

  constructor(private discord: DiscordService) {
    super();
  }
  async handle(message: DiscordMessage, command: string, intensity = '10') {
    const guild = (message.messageChannel as TextChannel).guild;
    if (
      !(
        await guild.members.fetch({
          user: message.discordMessage,
        })
      ).permissions.has('MOVE_MEMBERS')
    ) {
      return {
        files: [],
        message: `Sorry bro, you can't shake`,
      };
    }
    const channels = (await guild.channels.fetch()).filter(
      (c) =>
        c.type === 'GUILD_VOICE' &&
        c.permissionsFor(this.discord.getClient.user).has('CONNECT') &&
        c.id !== guild.afkChannelId,
    );

    switch (command) {
      case 'list':
        return {
          files: [],
          message: channels.map((c) => `${c.id} - ${c.name}`).join('\n'),
        };
      default:
        const userId = matchUser(command);
        if (!userId) {
          return {
            files: [],
            message: `User not found`,
          };
        }
        const victim = await guild.members.fetch(userId);
        if (!victim.voice?.channelId)
          return {
            files: [],
            message: `${command} is not in a voice channel!`,
          };
        const origin = victim.voice.channel;
        if (origin.type === 'GUILD_STAGE_VOICE') {
          return {
            files: [],
            message: `Can't shake ppl on stage sorry`,
          };
        }
        const I =
          isNaN(Number(intensity)) ||
          Number(intensity) < 0 ||
          Number(intensity) > 10
            ? 2
            : Math.round(Number(intensity));
        const movableChannels = channels
          .filter((f) => f.permissionsFor(userId).has('CONNECT'))
          .toJSON() as VoiceChannel[];

        try {
          for (let i = 0; i < I; i++) {
            await victim.voice.setChannel(
              movableChannels[i % movableChannels.length],
              'you got shaken',
            );

            await sleep(2000 / I);
          }
          await victim.voice.setChannel(origin, 'you got shaken');
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
