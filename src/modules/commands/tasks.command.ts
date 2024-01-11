import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import { TrelloService } from '../trello/trello.service';
import moment from 'moment';
import { TasksService } from '../scheduler/tasks.service';
import { TaskList } from '../scheduler/task.type';

@Injectable()
export class TasksCommand extends BaseCommand {
  public name = 'tasks';
  public command = /^tasks(?: (.*))?/i;
  public requiresAuth = true;

  constructor(private tasks: TasksService) {
    super();
  }

  async handle(message: Message, query: string) {
    const lists = await this.tasks.getTasks();

    switch (query) {
      case 'list':
        return {
          files: [],
          message:
            'Available Lists \n' + lists.map((l) => '- ' + l.title).join('\n'),
        };
      default:
        const tasks = await this.tasks.getTasks({
          getTaskInfo: true,
          filter: query,
        });
        const res = tasks
          .map(
            (l) =>
              `${l.title}:
${l.tasks
  .map(
    (c) =>
      `${c.title}${
        c.date
          ? ' due ' +
            `${moment(c.date).fromNow()} (${moment(c.date).format(
              'DD/MM/YYYY HH:mm',
            )})`
          : ''
      }`,
  )
  .join('\n')}`,
          )
          .join('\n');
        return {
          files: [],
          message: res.length > 0 ? res : 'List not found',
        };
    }
  }
}
