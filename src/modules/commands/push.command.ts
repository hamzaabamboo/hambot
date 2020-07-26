import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message, DiscordMessage } from '../messages/messages.model';
import { TrelloService } from '../trello/trello.service';
import moment = require('moment');

@Injectable()
export class PushCommand extends BaseCommand {
  public command = /push(?: (register|remove)(?: (.*))?)?/i;
  public requiresAuth = true;
  public platforms = ['discord'];

  constructor(private trello: TrelloService) {
    super();
  }

  async handle(message: Message, command: string, tag: string) {
    const board = (await this.trello.getBoards()).find(
      b => b.name === 'HamBot',
    );

    const list = (await this.trello.getLists(board.id)).find(
      l => l.name === 'broadcast',
    );

    const cards = await this.trello.getCards(list.id);
    switch (command) {
      case 'register':
        if (message.channel === 'discord') {
          if (
            cards.find(
              c =>
                c.name ===
                `${message.channel}: ${
                  (message as DiscordMessage).messageChannel.id
                }`,
            )
          )
            return {
              ...message,
              files: [],
              message: 'This channel is already registered ',
            };
          await this.trello.addCard(
            list.id,
            `${message.channel}: ${
              (message as DiscordMessage).messageChannel.id
            }`,
            tag,
          );
          return {
            ...message,
            files: [],
            message: `Added this channel to receive push notifications`,
          };
        }
      case 'remove':
        if (message.channel === 'discord') {
          const toDel = cards.find(
            c =>
              c.name ===
              `${message.channel}: ${
                (message as DiscordMessage).messageChannel.id
              }`,
          );
          if (!toDel)
            return {
              ...message,
              files: [],
              message: 'This channel is not yet registered ',
            };
          await this.trello.deleteCard(toDel.id);
          return {
            ...message,
            files: [],
            message: `Removed this channel from receiving notifications`,
          };
        }
      default:
        return {
          ...message,
          files: [],
          message: 'Usage: push <register/remove> <tag>',
        };
    }
  }
}
