import { Injectable } from '@nestjs/common';
import { DiscordService } from '../discord/discord.service';
import { LineService } from '../line/line.service';
import {
  Message,
  DiscordMessage,
  FileWithUrl,
} from '../messages/messages.model';
import { TrelloService } from '../trello/trello.service';
import { MessagesService } from '../messages/messages.service';
import { AppLogger } from '../logger/logger';
import moment = require('moment');
import { async } from 'rxjs';

@Injectable()
export class PushService {
  private _cache: {
    timestamp: number;
    data: {
      channel: string;
      id: string;
      tag: string;
    }[];
  };
  constructor(
    private trello: TrelloService,
    private messageService: MessagesService,
    private discord: DiscordService,
    private logger: AppLogger,
  ) {
    this.logger.setContext('PushService');
  }

  async getDestinations() {
    if (!this._cache || moment().diff(this._cache.timestamp, 'm') > 1) {
      this.logger.verbose('Cache empty fetching push destinations');
      const board = (await this.trello.getBoards()).find(
        b => b.name === 'HamBot',
      );

      const list = (await this.trello.getLists(board.id)).find(
        l => l.name === 'broadcast',
      );

      const cards = await this.trello.getCards(list.id);
      this._cache = {
        timestamp: new Date().valueOf(),
        data: cards.map(card => {
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

  async push(message: Message) {
    const destinations = await this.getDestinations();

    destinations.forEach(d => {
      const f = async () => {
        switch (d.channel) {
          case 'discord':
            await this.messageService.sendMessage({
              ...message,
              files: [],
              channel: 'discord',
              messageChannel: await this.discord.getClient.channels.fetch(d.id),
            });
        }
      };
      f();
    });
    return message;
  }
}
