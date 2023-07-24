import { Injectable } from '@nestjs/common';
import { AudioService } from 'src/modules/audio/audio.service';
import { StreamService } from 'src/modules/deprecated/stream/stream.service';
import { DiscordMessage } from '../../messages/messages.model';
import { BaseCommand } from '../command.base';

@Injectable()
export class StreamCommand extends BaseCommand {
  public name = 'stream';
  public command = /^stream(?: (start|stop))?/i;
  public requiresAuth = true;
  public platforms = ['discord'];

  constructor(private audio: AudioService, private stream: StreamService) {
    super();
  }

  async handle(message: DiscordMessage, command: string) {
    switch (command) {
      case 'start':
        try {
          const key = await this.stream.startServer(message.senderId);
          if (message.channel === 'discord') {
            const guild = message.discordMessage.guild;
            if (!guild) break;
            const dm = await (
              await guild.members.fetch(message.senderId)
            ).createDM();
            dm.send({ content: 'Your stream key is ' + key });
          }
          await this.stream.listenToStream(message.senderId);
          // await this.audio.playAudio(message, this.stream.stream, 1, 5, 64);
          this.stream.stream.on('close', () => {
            this.stream.stopServer();
            this.audio.stopPlaying(message);
          });
          return {
            files: [],
            message: `Streaming Sound`,
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
      case 'stop':
        await this.audio.stopPlaying(message);
        this.stream.stopServer();
        return {
          files: [],
          message: `Stopped music`,
        };

      default:
        return {
          files: [],
          message: 'Usage: stream <start|stop>',
        };
    }
  }
}
