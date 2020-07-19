import { Injectable } from '@nestjs/common';
import { Message, DiscordMessage } from '../../messages/messages.model';
import { BaseCommand } from '../command.base';
import { DiscordService } from 'src/modules/discord/discord.service';
import * as ytdl from 'ytdl-core';
import { AudioService } from 'src/modules/audio/audio.service';

@Injectable()
export class YoutubeCommand extends BaseCommand {
  public command = /^(?:youtube|yt)(?: (volume|play|stop)(?: ([^\s]+)(?: ([\d]{1,99}([.]\d{1,99})?)?)?)?)?/i;
  public requiresAuth = false;
  public platforms = ['discord'];

  constructor(private discord: DiscordService, private audio: AudioService) {
    super();
  }
  async handle(
    message: DiscordMessage,
    command: string,
    url: string,
    volume?: string,
  ): Promise<Message> {
    switch (command) {
      case 'play':
        if (!url) {
          return {
            ...message,
            files: [],
            message: `Please supply a url`,
          };
        }
        const meta = await ytdl.getInfo(url);
        if (!meta) {
          return {
            ...message,
            files: [],
            message: `Video not found`,
          };
        }
        try {
          await this.audio.playAudio(
            message,
            ytdl(url),
            isNaN(Number(volume)) || Number(volume) > 1
              ? undefined
              : Number(volume),
          );
          return {
            ...message,
            files: [],
            message: `Playing \`${meta.videoDetails.title}\``,
          };
        } catch {
          return {
            ...message,
            files: [],
            message: `Can't play music`,
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
          message: 'Usage: stream <list|play|stop> index',
        };
    }
  }
}
