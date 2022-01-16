import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import { TrelloService } from '../trello/trello.service';
@Injectable()
export class PushCommand extends BaseCommand {
  public name = 'push';
  public command = /^push(?: (register|remove|status|update)(?: (.*))?)?/i;
  public requiresAuth = true;
  public platforms = ['discord'];

  constructor(private trello: TrelloService) {
    super();
  }

  async handle(message: Message, command: string, tag: string) {
    const board = (await this.trello.getBoards()).find(
      (b) => b.name === 'HamBot',
    );

    const list = (await this.trello.getLists(board.id)).find(
      (l) => l.name === 'broadcast',
    );

    const cards = await this.trello.getCards(list.id);
    switch (command) {
      case 'register':
        if (
          cards.find(
            (c) => c.name === `${message.channel}: ${message.channelId}`,
          )
        )
          return {
            files: [],
            message: 'This channel is already registered ',
          };
        await this.trello.addCard(
          list.id,
          `${message.channel}: ${message.channelId}`,
          tag,
        );
        return {
          files: [],
          message: `Added this channel to receive push notifications`,
        };
      case 'update':
        const id = cards.find(
          (c) => c.name === `${message.channel}: ${message.channelId}`,
        ).id;
        if (!id)
          return {
            files: [],
            message: 'This channel is not registered',
          };
        await this.trello.editCard(id, undefined, tag, list.id);
        return {
          files: [],
          message: tag
            ? `Added this channel to receive ${tag} tags`
            : `This channel is now only listening to public updates`,
        };
      case 'status':
        const currTag = cards.find(
          (c) => c.name === `${message.channel}: ${message.channelId}`,
        );
        if (!currTag)
          return {
            files: [],
            message: 'This channel is not registered',
          };
        return {
          files: [],
          message: currTag.desc
            ? `This channel is receiving ${currTag.desc} and public messages`
            : `This channel is only receiving public messages`,
        };
      case 'remove':
        const toDel = cards.find(
          (c) => c.name === `${message.channel}: ${message.channelId}`,
        );
        if (!toDel)
          return {
            files: [],
            message: 'This channel is not yet registered ',
          };
        await this.trello.deleteCard(toDel.id);
        return {
          files: [],
          message: `Removed this channel from receiving notifications`,
        };
      default:
        return {
          files: [],
          message: 'Usage: push <register/remove/status/update> <tag>',
        };
    }
  }
}
