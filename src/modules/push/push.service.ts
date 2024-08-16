import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { TextChannel } from 'discord.js';
import moment from 'moment';
import { AppConfigService } from 'src/config/app-config.service';
import { DiscordService } from '../discord/discord.service';
import { AppLogger } from '../logger/logger';
import { Message, MessageChannel } from '../messages/messages.model';
import { MessagesService } from '../messages/messages.service';
import { TrelloService } from '../trello/trello.service';
@Injectable()
export class PushService {
  private _cache: {
    timestamp: number;
    data: {
      channel: MessageChannel;
      id: string;
      tag?: string;
    }[];
  };
  constructor(
    private trello: TrelloService,
    @Inject(forwardRef(() => MessagesService))
    private messageService: MessagesService,
    @Inject(forwardRef(() => DiscordService))
    private discord: DiscordService,
    private logger: AppLogger,
    private config: AppConfigService,
  ) {
    this.logger.setContext('PushService');
    if (this.config.NODE_ENV) {
      this.push(
        {
          channel: '*',
          senderId: '',
          message: `HamBot Online! (${this.config.NODE_ENV ?? 'Development'})`,
        },
        'debug',
      );
    }
  }

  async getDestinations() {
    if (!this._cache || moment().diff(this._cache.timestamp, 'm') > 1) {
      this.logger.verbose('Cache empty fetching push destinations');
      const board = (await this.trello.getBoards()).find(
        (b) => b.name === 'HamBot',
      );

      const list = (await this.trello.getLists(board.id)).find(
        (l) => l.name === 'broadcast',
      );

      const cards = await this.trello.getCards(list.id);
      this._cache = {
        timestamp: new Date().valueOf(),
        data: cards.map((card) => {
          const match = card.name.match(/(.*): (.*)/);
          return {
            channel: match[1],
            id: match[2],
            tag: card.desc,
          };
        }),
      };
    }
    return this._cache.data;
  }

  async push(message: Message, tag?: string) {
    const destinations = await this.getDestinations();
    destinations
      .filter((d) =>
        tag
          ? d.tag?.toLowerCase().includes(tag.toLowerCase()) || tag === 'public'
          : false,
      )
      .forEach((d) => {
        const f = async () => {
          switch (d.channel) {
            case 'discord': {
              if (this.discord.isReady !== true) await this.discord.isReady;
              try {
                await this.messageService.sendMessage({
                  ...message,
                  senderId: '',
                  channel: 'discord',
                  messageChannel: (await this.discord.getClient.channels.fetch(
                    d.id,
                  )) as TextChannel,
                });
              } catch {}
              break;
            }
            case 'line':
              await this.messageService.sendMessage({
                ...message,
                senderId: '',
                channel: 'line',
                pushTo: d.id,
              });
              break;
            default:
              await this.messageService.sendMessage({
                ...message,
                channel: d.channel,
                channelId: d.id,
                senderId: '',
              });
              break;
          }
        };
        f();
      });
    return message;
  }
}
