import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ChannelType, TextChannel, VoiceChannel } from 'discord.js';
import { DiscordService } from 'src/modules/discord/discord.service';
import { matchUser } from 'src/modules/discord/discord.utils';
import { setTimeout as sleep } from 'timers/promises';
import { DiscordMessage } from '../../messages/messages.model';
import { BaseCommand } from '../command.base';

@Injectable()
export class ShakeCommand extends BaseCommand {
  public name = 'shake';
  public command = /^shake(?: ([^\s]*)(?: (\d+)(?: (\d+)(?: (\d+)?))?)?)?/i;
  public platforms = ['discord'];

  constructor(
    @Inject(forwardRef(() => DiscordService))
    private discord: DiscordService,
  ) {
    super();
  }
  async handle(message: DiscordMessage, command: string, intensity = '10') {
    const guild = (message.messageChannel as TextChannel).guild;
    if (
      !(
        await guild.members.fetch({
          user: message.discordMessage,
        })
      ).permissions.has('MoveMembers')
    ) {
      return {
        files: [],
        message: `Sorry bro, you can't shake`,
      };
    }
    const channels = (await guild.channels.fetch()).filter(
      (c) =>
        c.type === ChannelType.GuildVoice &&
        c.permissionsFor(this.discord.getClient.user).has('Connect') &&
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
        if (origin.type === ChannelType.GuildStageVoice) {
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
          .filter((f) => f.permissionsFor(userId).has('Connect'))
          .toJSON() as VoiceChannel[];

        try {
          for (let i = 0; i < I; i++) {
            await victim.voice.setChannel(
              movableChannels[i % movableChannels.length],
              `You got shaken (${i}/${I})`,
            );
            await sleep(2000 / I);
          }
          await victim.voice.setChannel(origin, `Welcome back home`);
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
