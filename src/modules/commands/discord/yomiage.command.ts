import { AudioResource } from '@discordjs/voice';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { lastValueFrom } from 'rxjs';
import { AudioService } from 'src/modules/audio/audio.service';
import { MessagesService } from 'src/modules/messages/messages.service';
import { DiscordMessage } from '../../messages/messages.model';
import { BaseCommand } from '../command.base';

@Injectable()
export class YomiageCommand extends BaseCommand {
  public name = 'yomiage';
  public command = /^(?:yomiage)(?: (.*))?/i;
  public requiresAuth = false;
  public platforms = ['discord'];
  private queue = new Map<string, string[]>();
  private playState = new Map<string, boolean>();
  private message: MessagesService;
  private isStarted = false;

  constructor(
    private audio: AudioService,
    private config: ConfigService,
    private http: HttpService,
    moduleRef: ModuleRef,
  ) {
    super();
    this.message = moduleRef.get(MessagesService, { strict: false });
  }

  async flushQueue(message: DiscordMessage, player?: AudioResource) {
    const key = `${message.channel}: ${message.discordMessage.guildId}`;
    if (!this.queue.has(key) || this.queue.get(key).length === 0) {
      return;
    }
    player?.playStream.removeAllListeners();
    const letter = this.queue.get(key).shift();

    this.audio
      .playAudio(message, await this.getAudio(letter), 1, 600000)
      .then(
        (r) => r.playStream?.on('end', () => void this.flushQueue(message, r)),
      );
  }

  async getAudio(string: string) {
    try {
      const data = await lastValueFrom(
        this.http.post(
          this.config.get('VOICEVOX_SERVER') +
            `audio_query?speaker=0&text=${encodeURIComponent(string)}`,
        ),
      );
      const sound = await lastValueFrom(
        this.http.post(
          this.config.get('VOICEVOX_SERVER') + `synthesis?speaker=0`,
          data.data,
          { responseType: 'stream' },
        ),
      );
      return sound.data;
    } catch (error) {
      console.log('fuck', error);
      throw error;
    }
  }

  async playAudio(message: DiscordMessage, string: string) {
    if (string.length < 1) return;
    const key = `${message.channel}: ${message.discordMessage.guildId}`;

    if (this.audio.isPlaying(message)) {
      if (!this.queue.has(key)) this.queue.set(key, []);
      this.queue.get(key).push(string);
    } else {
      const player = await this.audio.playAudio(
        message,
        await this.getAudio(string),
        1,
        600000,
      );
      player.playStream.on('end', () => void this.flushQueue(message, player));
    }
  }

  async handle(message: DiscordMessage, command: string) {
    switch (command?.trim()) {
      case 'start':
        await this.playAudio(message, 'こんにちは');
        this.isStarted = true;
        return {
          message: 'Yomiage Sutaato',
        };
      default: {
        await this.playAudio(message, command);
        return {
          files: [],
          message: '',
        };
      }
    }
  }
}
