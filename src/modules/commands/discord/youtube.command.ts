import { Injectable } from '@nestjs/common';
import { Message, DiscordMessage } from '../../messages/messages.model';
import { BaseCommand } from '../command.base';
import { DiscordService } from 'src/modules/discord/discord.service';
import ytdl from 'ytdl-core';
import ytsr from 'ytsr';
import { AudioService } from 'src/modules/audio/audio.service';
import { createWriteStream } from 'fs';
import { MessagesService } from 'src/modules/messages/messages.service';
import { ModuleRef } from '@nestjs/core';
import { AudioPlayer, AudioResource } from '@discordjs/voice';

@Injectable()
export class YoutubeCommand extends BaseCommand {
  public name = 'youtube';
  public command =
    /^(?:youtube|yt)(?: (volume|play|stop|skip|queue)(?: (.*)?)?)?/i;
  public requiresAuth = false;
  public platforms = ['discord'];
  private queue = new Map<string, { name: string; url: string }[]>();
  private playState = new Map<string, boolean>();
  private message: MessagesService;

  constructor(private audio: AudioService, moduleRef: ModuleRef) {
    super();
    this.message = moduleRef.get(MessagesService, { strict: false });
  }

  flushQueue(message: DiscordMessage, player?: AudioResource) {
    const key = `${message.channel}: ${message.discordMessage.guildId}`;
    if (!this.queue.has(key) || this.queue.get(key).length === 0) {
      return;
    }
    player?.playStream.removeAllListeners();
    const { name, url } = this.queue.get(key).shift();

    this.message.sendMessage({
      ...message,
      message: `Playing: ${name}`,
    });
    this.audio
      .playAudio(message, ytdl(url, { quality: 18 }))
      .then((r) => r.playStream?.on('end', () => this.flushQueue(message, r)));
  }

  async playYoutubeVid(message: DiscordMessage, url, volume) {
    if (!url) {
      return {
        files: [],
        message: `Please supply a url`,
      };
    }
    const vidUrl = /^http(s)?:\/\/(.*)/.test(url)
      ? url
      : ((await ytsr(url)).items.find((e) => e.type === 'video') as ytsr.Video)
          .url;
    const meta = await ytdl.getInfo(vidUrl);
    if (!meta) {
      return {
        files: [],
        message: `Video not found`,
      };
    }

    try {
      const key = `${message.channel}: ${message.discordMessage.guildId}`;
      if (this.audio.isPlaying(message)) {
        if (!this.queue.has(key)) this.queue.set(key, []);
        this.queue.get(key).push({
          name: meta.videoDetails.title,
          url: vidUrl,
        });

        return {
          files: [],
          message: `\`${meta.videoDetails.title}\` added to queue (${
            this.queue.get(key).length
          })`,
        };
      } else {
        const player = await this.audio.playAudio(
          message,
          ytdl(vidUrl, { quality: 18 }),
          isNaN(Number(volume)) || Number(volume) > 1
            ? undefined
            : Number(volume),
        );

        player.playStream.on('end', () => this.flushQueue(message, player));
      }

      return {
        files: [],
        message: `Playing \`${meta.videoDetails.title}\``,
      };
    } catch (e) {
      if (e.message === 'PLAYING') {
        return {
          files: [],
          message: `Something is playing, we don't have queue. So either stop or wait lul`,
        };
      }
      return {
        files: [],
        message: `Something went wrong`,
      };
    }
  }

  async handle(
    message: DiscordMessage,
    command: string,
    url: string,
    volume?: string,
  ) {
    switch (command) {
      case 'play':
        return this.playYoutubeVid(message, url, volume);
      case 'skip':
        await this.audio.stopPlaying(message);
        this.flushQueue(message, this.audio.getPlayer(message));
        return {
          files: [],
          message: `Skipped`,
        };
      case 'stop':
      case 'bye':
        this.queue.delete(
          `${message.channel}: ${message.discordMessage.guildId}`,
        );
        await this.audio.stopPlaying(message);
        return {
          files: [],
          message: `Bye`,
        };
      case 'volume':
        const vol = Number(url);
        if (isNaN(vol) || vol <= 0 || vol >= 1) {
          return {
            files: [],
            message: 'Invalid volume value ( only  0 - 1 )',
          };
        }
        await this.audio.changeVolume(message, vol);
        return {
          files: [],
          message: `Changed volume to ${Math.round(vol * 100)}%`,
        };
      default:
        return {
          files: [],
          message: 'Usage: stream <list|play|stop> index',
        };
    }
  }
}
