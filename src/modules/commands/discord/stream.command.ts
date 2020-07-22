import { Injectable } from '@nestjs/common';
import { Message, DiscordMessage } from '../../messages/messages.model';
import { BaseCommand } from '../command.base';
import { DiscordService } from 'src/modules/discord/discord.service';
import * as ytdl from 'ytdl-core';
import { AudioService } from 'src/modules/audio/audio.service';
import { StreamService } from 'src/modules/audio/stream/stream.service';
import { async } from 'rxjs';
import { DiscordModule } from 'src/modules/discord/discord.module';
import { VoiceChannel } from 'discord.js';

const sleep = duration => new Promise(resolve => setTimeout(resolve, duration));
@Injectable()
export class StreamCommand extends BaseCommand {
  public command = /^stream(?: (start|stop))?/i;
  public requiresAuth = false;
  public platforms = ['discord'];

  constructor(
    private discord: DiscordService,
    private audio: AudioService,
    private stream: StreamService,
  ) {
    super();
  }

  async handle(
    message: DiscordMessage,
    command: string,
    url: string,
    volume?: string,
  ): Promise<Message> {
    switch (command) {
      case 'start':
        try {
          const key = await this.stream.startServer();
          if (message.channel === 'discord') {
            const guild = (message.messageChannel as VoiceChannel).guild;
            if (!guild) break;
            const dm = await (
              await guild.members.fetch(message.senderId)
            ).createDM();
            dm.send({ content: 'Your stream key is ' + key });
          }
          await this.stream.listenToStream(key);
          await this.audio.playAudio(message, this.stream.stream, 1, 6, 64);
          this.stream.stream.on('close', () => {
            this.stream.stopServer();
            this.audio.stopPlaying(message);
          });
          return {
            ...message,
            files: [],
            message: `Streaming Sound`,
          };
        } catch (e) {
          if (e.message === 'PLAYING') {
            return {
              ...message,
              files: [],
              message: `Something is playing, we don't have queue. So either stop or wait lul`,
            };
          }
          return {
            ...message,
            files: [],
            message: `Something went wrong`,
          };
        }
      case 'stop':
        await this.audio.stopPlaying(message);
        this.stream.stopServer();
        return {
          ...message,
          files: [],
          message: `Stopped music`,
        };

      default:
        return {
          ...message,
          files: [],
          message: 'Usage: stream <start|stop>',
        };
    }
  }
}
