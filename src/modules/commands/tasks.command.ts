import { Injectable } from '@nestjs/common';
import { BaseCommand } from './base.command';
import { Message } from '../messages/messages.model';
import { TrelloService } from '../trello/trello.service';
import moment = require('moment');

@Injectable()
export class TasksCommand extends BaseCommand {
  public command = /tasks(?: (.*))?/i;

  constructor(private trello: TrelloService) {
    super();
  }

  async handle(message: Message, query: string) {
    const board = (await this.trello.getBoards()).find(
      b => b.name === "Ham's Stuff",
    );

    const lists = (await this.trello.getLists(board.id)).filter(list =>
      query && query !== ''
        ? list.name.toLowerCase().includes(query.toLowerCase())
        : list.name === 'To Do' || list.name === 'Doing',
    );
    const cards = (
      await Promise.all<any[]>(lists.map(e => this.trello.getCards(e.id)))
    )
      .flatMap(e => e)
      .sort((a, b) => moment(a.due).diff(b.due));
    const res = cards
      .map(
        e =>
          `${e.name} ${
            e.due ? 'due ' + moment(e.due).format('DD/MM/YYYY HH:mm') : ''
          }`,
      )
      .join('\n');
    return {
      ...message,
      message: res.length > 0 ? res : 'No Tasks found',
    };
  }
}
