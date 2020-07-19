import { Injectable } from '@nestjs/common';
import { Message, DiscordMessage } from '../../messages/messages.model';
import { BaseCommand } from '../command.base';
import { DiscordService } from 'src/modules/discord/discord.service';
import * as ytdl from 'ytdl-core';
import { AudioService } from 'src/modules/audio/audio.service';
import { StreamService } from 'src/modules/audio/stream/stream.service';

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
          await this.audio.playAudio(
            message,
            'http://localhost:8000/stream/audioStream.flv',
            1,
          );
          this.stream.stream.on('data', console.log);
          return {
            ...message,
            files: [],
            message: `Streaming Sound`,
          };
        } catch {
          return {
            ...message,
            files: [],
            message: `Something went wrong`,
          };
        }
      case 'stop':
        await this.audio.stopPlaying(message);
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
