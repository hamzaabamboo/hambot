import { AudioResource } from '@discordjs/voice';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { VoiceState } from 'discord.js';
import { lastValueFrom } from 'rxjs';
import { AudioService } from 'src/modules/audio/audio.service';
import { DiscordMessage, Message } from '../../messages/messages.model';
import {
  BaseCompoundHandler,
  CompoundResponse,
} from '../compound.handler.base';

@Injectable()
export class RusubanCommand extends BaseCompoundHandler {
  public name = 'rusuban';
  public static startCommand =
    /^(?:rusuban)(?:(?: (start|change|test)(?: (\d+))?))?/i;
  public command = /(.*?)/;
  public endCommand = /^(end)/;
  public requiresAuth = true;
  public platforms = ['discord'];
  private queue = new Map<string, string[]>();

  private audio: AudioService;
  private config: ConfigService;
  private http: HttpService;

  private speakerId = '0';
  private isStarted = false;

  private guildData = new Map<string, any>();
  private audioCache = new Map<string, any>();

  constructor(moduleRef: ModuleRef) {
    super(moduleRef);
    this.audio = moduleRef.get(AudioService, { strict: false });
    this.config = moduleRef.get(ConfigService, { strict: false });
    this.http = moduleRef.get(HttpService, { strict: false });
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
      .then((r) =>
        r.playStream?.on('end', () => void this.flushQueue(message, r)),
      );
  }

  async getAudio(string: string, speakerId: string = this.speakerId) {
    try {
      let d = this.audioCache.get(string);
      if (!d) {
        d = await lastValueFrom(
          this.http.post(
            this.config.get('VOICEVOX_SERVER') +
              `audio_query?speaker=${speakerId}&text=${encodeURIComponent(
                string,
              )}`,
          ),
        );
        this.audioCache.set(string, d);
      }
      const sound = await lastValueFrom(
        this.http.post(
          this.config.get('VOICEVOX_SERVER') + `synthesis?speaker=${speakerId}`,
          d.data,
          { responseType: 'stream' },
        ),
      );
      return sound.data;
    } catch (error) {
      throw error;
    }
  }

  async playAudio(
    message: DiscordMessage,
    string: string,
    onAudioEnd?: () => void,
  ) {
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
        -1,
      );
      player.playStream.on(
        'end',
        onAudioEnd || (() => this.flushQueue(message, player)),
      );
    }
  }

  async handleInput(message: Message): Promise<CompoundResponse> {
    if (this.endCommand.test(message.message)) {
      return this.handleEnd(message as DiscordMessage);
    }
    if (RusubanCommand.startCommand.test(message.message)) {
      const params = RusubanCommand.startCommand.exec(message.message).slice(1);
      return this.handleStart(message as DiscordMessage, params[0], params[1]);
    }
    if (this.isStarted) {
      return this.handleMessages(message as DiscordMessage);
    }
  }

  async handleMessages(message: DiscordMessage) {
    return {
      isCompounding: true,
      message: {
        files: [],
        message: '',
      },
    };
  }
  handleVoiceStateChange = async (
    oldState: VoiceState,
    newState: VoiceState,
  ) => {
    if (
      !(
        this.guildData.has(newState.guild.id) ||
        this.guildData.has(oldState.guild.id)
      )
    )
      return;
    if (oldState.channelId === newState.channelId) return;

    const msg =
      this.guildData.get(newState.guild.id) ||
      (this.guildData.get(oldState.guild.id) as DiscordMessage);
    const memberId = newState.member.id || oldState.member.id;

    if (memberId === msg.discordMessage.client.user.id) return;

    if (
      newState.channelId ===
      (await msg.discordMessage.guild.members.fetch(msg.senderId)).voice
        .channelId
    ) {
      await this.playAudio(msg, 'いらっしゃいませ〜');
    } else {
      await this.playAudio(msg, 'いってらっしゃいませ〜');
    }
  };

  async handleStart(
    message: DiscordMessage,
    command: string,
    speakerId: string = '0',
  ) {
    switch (command?.trim()) {
      case 'start':
        this.speakerId = speakerId;
        const channelId = (
          await message.discordMessage.guild.members.fetch(message.senderId)
        ).voice.channelId;
        this.guildData.set(message.discordMessage.guild.id, message);
        message.discordMessage.client.on(
          'voiceStateUpdate',
          this.handleVoiceStateChange,
        );
        await lastValueFrom(
          this.http.post(
            this.config.get('VOICEVOX_SERVER') +
              `initialize_speaker?speaker=${speakerId}&skip_reinit=true`,
          ),
        );
        await this.playAudio(
          message,
          'こんにちは、ハム様のメイドです。よろしくお願いいたします',
        );
        this.isStarted = true;
        return {
          isCompounding: true,
          message: {
            message: 'Rusuban Sutaato',
          },
        };
      case 'change':
        if (!this.isStarted)
          return {
            isCompounding: false,
            message: {
              message: 'Not started yet, type "yomiage start" first',
            },
          };
        this.audioCache.clear();
        await lastValueFrom(
          this.http.post(
            this.config.get('VOICEVOX_SERVER') +
              `initialize_speaker?speaker=${speakerId}&skip_reinit=true`,
          ),
        );
        this.speakerId = speakerId;
        await this.playAudio(
          message,
          '声の変更が完了いたしました、わたくしの新しい声はいかがでしょうか',
        );
        return {
          isCompounding: true,
          message: {
            message: 'Voice Changed',
          },
        };
      default:
        return {
          isCompounding: false,
          message: {
            message: 'Wakarimasen',
          },
        };
    }
  }

  async handleEnd(message: DiscordMessage) {
    await this.playAudio(
      message,
      'ご利用いただきありがとうございました。また会いましょう',
      () => void this.audio.stopPlaying(message),
    );
    message.discordMessage.client.off(
      'voiceStateUpdate',
      this.handleVoiceStateChange,
    );
    return {
      isCompounding: false,
      message: {
        files: [],
        message: '',
      },
    };
  }
}
