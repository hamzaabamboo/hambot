import { AudioResource } from '@discordjs/voice';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { lastValueFrom } from 'rxjs';
import { AudioService } from 'src/modules/audio/audio.service';
import { DiscordMessage, Message } from '../../messages/messages.model';
import { BaseCompoundHandler, CompoundResponse } from '../compound.handler.base';

@Injectable()
export class YomiageCommand extends BaseCompoundHandler {
  public name = 'yomiage';
  public static startCommand = /^(?:yomiage)(?:(?: (start|change|test)(?: (\d+))?))?/i;
  public command = /(.*?)/;
  public endCommand = /^(end)/;
  public requiresAuth = false;
  public platforms = ['discord'];
  private queue = new Map<string, string[]>();

  private audio: AudioService
  private config: ConfigService
  private http: HttpService

  private speakerId = '0';
  private isStarted = true;

  constructor(
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
    this.audio = moduleRef.get(AudioService, {strict:false})
    this.config = moduleRef.get(ConfigService, {strict:false})
    this.http = moduleRef.get(HttpService, {strict:false})
  }

  matchInput(input: string): boolean {
    return this.command.test(input);
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

  async getAudio(string: string, speakerId: string = this.speakerId) {
    try {
      const data = await lastValueFrom(
        this.http.post(
          this.config.get('VOICEVOX_SERVER') +
            `audio_query?speaker=${speakerId}&text=${encodeURIComponent(string)}`,
        ),
      );
      const sound = await lastValueFrom(
        this.http.post(
          this.config.get('VOICEVOX_SERVER') + `synthesis?speaker=${speakerId}`,
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

  async playAudio(message: DiscordMessage, string: string, onAudioEnd?: () => void) {
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
      player.playStream.on('end', onAudioEnd || ( () => this.flushQueue(message, player)));
    }
  }

  async handleInput(message: Message): Promise<CompoundResponse> {
    if (this.endCommand.test(message.message)) {
      return this.handleEnd(message as DiscordMessage);
    }
    if (YomiageCommand.startCommand.test(message.message)) {
      const params = YomiageCommand.startCommand.exec(message.message).slice(1);
      return this.handleStart(message as DiscordMessage, params[0], params[1]);
    }
    if (this.isStarted) {
      return this.handleMessages(message as DiscordMessage);
    }
  }

  async handleMessages(message: DiscordMessage) {
      await this.playAudio(message, message.message.trim());
      return {
        isCompounding: true,
       message: {
        files: [],
        message: '',
       }
      };
  }

  async handleStart(message: DiscordMessage, command: string, speakerId: string = '0') {
    switch (command?.trim()) {
      case 'start':
        this.speakerId = speakerId;
        await this.playAudio(message, 'こんにちは、ハム様のメイドです。よろしくお願いいたします');
        this.isStarted = true;
        return {
          isCompounding: true,
          message: {
           message: 'Yomiage Sutaato',
          }
        };
      case 'change':
        if (!this.isStarted)   return {
          isCompounding: false,
          message: {
            message: 'Not type yomiage start first',
          }
        };
        this.speakerId = speakerId;
        await this.playAudio(message, 'こんにちは、ハム様のメイドです。よろしくお願いいたします');
        return {
          isCompounding: true,
          message: {
            message: 'Yomiage Sutaato',
          }
        };
      case 'test':
        const tmp = this.speakerId;
        this.speakerId = speakerId;
        await this.playAudio(message, 'これはテストです。あいうえお、かきくけこ、なんでやねん。', () => void this.audio.stopPlaying(message));
        this.speakerId = tmp;
        return {
          isCompounding: false,
          message: {
            message: 'Yomiage Sutaato',
          }
        };
      default: 
        return {
          isCompounding: false,
          message: {
          message: 'Wakarimasen',
          }
        };
    }
  }

  async handleEnd(message: DiscordMessage) {
    await this.playAudio(message, 'ご利用いただきありがとうございました。また会いましょう', () => void this.audio.stopPlaying(message))
    return {
      isCompounding: false,
      message: {
        files: [],
        message: '',
      }
    };
  }
}
