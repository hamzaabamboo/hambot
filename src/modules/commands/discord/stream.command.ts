import { Injectable } from '@nestjs/common';
import { Message, DiscordMessage } from '../../messages/messages.model';
import { BaseCommand } from '../command.base';
import { DiscordService } from 'src/modules/discord/discord.service';
import * as ytdl from 'ytdl-core';
import { AudioService } from 'src/modules/audio/audio.service';
import { StreamService } from 'src/modules/audio/stream/stream.service';
import { async } from 'rxjs';
import { DiscordModule } from 'src/modules/discord/discord.module';

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

  onReadable(message: DiscordMessage) {
    return () => {
      const f = async () => {
        this.stream.stream.removeListener('readable', this.onReadable);
      };
      f();
    };
  }
  onClose(message: DiscordMessage) {
    return () => {
      this.audio.stopPlaying(message);
    };
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
          this.stream.startServer();
          // this.stream.stream.on('readable', this.onReadable(message));
          const player = await this.audio.playAudio(
            message,
            this.stream.stream,
            1,
            6,
            64,
          );
          // player.pause();
          // await sleep(5000);
          // player.resume();
          this.stream.stream.on('close', this.onClose(message));
          return {
            ...message,
            files: [],
            message: `Streaming Sound`,
          };
        } catch (e) {
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
