import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
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

    const allLists = await this.trello.getLists(board.id);
    switch (query) {
      case 'list':
        return {
          ...message,
          message:
            'Available Lists \n' + allLists.map(l => '- ' + l.name).join('\n'),
        };
      default:
        const lists = allLists.filter(list =>
          query && query !== ''
            ? list.name.toLowerCase().includes(query.toLowerCase())
            : list.name === 'To Do' || list.name === 'Doing',
        );
        const cards = (
          await Promise.all<any>(
            lists.map(async e => ({
              list: e,
              cards: await this.trello.getCards(e.id),
            })),
          )
        ).map(({ list, cards }) => ({
          list,
          cards: cards.sort((a, b) => moment(a.due).diff(b.due)),
        }));

        const res = cards
          .map(
            l =>
              `${l.list.name}:\n${l.cards
                .map(
                  c =>
                    `${c.name} ${
                      c.due
                        ? 'due ' +
                          `${moment(c.due).fromNow()} (${moment(c.due).format(
                            'DD/MM/YYYY HH:mm',
                          )})`
                        : ''
                    }`,
                )
                .join('\n')}`,
          )
          .join('\n');
        return {
          ...message,
          message: res.length > 0 ? res : 'List not found',
        };
    }
  }
}
