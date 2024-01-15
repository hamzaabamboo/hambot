import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import moment from 'moment';
import { AppLogger } from '../logger/logger';
import { PushService } from '../push/push.service';
import { TrelloService } from '../trello/trello.service';
import { Paragraph, Text, List, PhrasingContent } from 'mdast';
import { OutlineService } from '../outline/outline.service';
import { dynamicImport } from 'src/utils';
import { TaskList } from './task.type';
import { List as TrelloList } from 'trello';

interface Task {
  card: string;
  msLeft?: number;
  due?: Date;
  name: string;
}

@Injectable()
export class TasksService {
  private _jobs: string[] = [];

  constructor(
    private trello: TrelloService,
    private outline: OutlineService,
    private scheduler: SchedulerRegistry,
    private push: PushService,
    private logger: AppLogger,
  ) {
    this.logger.setContext('TaskSchedule');
    this.update();
  }

  @Cron('0 0 0 * * *')
  update() {
    if (this._jobs.length > 0) {
      this._jobs.forEach((j) => {
        try {
          this.scheduler.deleteCronJob(j);
        } catch (e) {
          this.logger.error('Something went wrong: ' + e);
        }
      });
      this.logger.debug('Removed ' + this._jobs.length + ' jobs.');
      this._jobs = [];
    }
    this.registerEvents();
  }

  async registerEvents() {
    this.getTaskDeadlines().then((cards) => {
      cards.forEach(({ card, msLeft, due, name }) => {
        if (msLeft - 3600000 > 0) {
          const pre = setTimeout(() => {
            this.push.push(
              {
                channel: '*',
                senderId: '',
                message: `${name} is to due ${moment(due).fromNow()}`,
              },
              'tasks',
            );
          }, msLeft - 3600000);
          this.scheduler.addTimeout(`${card}-pre`, pre);
          this._jobs.push(`${card}-pre`);
        }

        const job = setTimeout(() => {
          this.push.push(
            {
              channel: '*',
              senderId: '',
              message: `${name} is due now !`,
            },
            'tasks',
          );
        }, msLeft);
        this.scheduler.addTimeout(`${card}-job`, job);
        this._jobs.push(`${card}-job`);
      });
      this.logger.debug('Added ' + cards.length + ' tasks');
    });
  }

  private async getTrelloTasks(
    getTasks = false,
    filter?: string,
  ): Promise<TaskList[]> {
    const board = (await this.trello.getBoards()).find(
      (b) => b.name === "Ham's Stuff",
    );

    const allLists = await this.trello.getLists(board.id);

    const filteredList = allLists.filter((list) =>
      filter && filter !== ''
        ? list.name.toLowerCase().includes(filter.toLowerCase())
        : list.name === 'To Do' || list.name === 'Doing',
    );

    const tasks: { list: TrelloList; cards?: { name: string; due: Date }[] }[] =
      getTasks
        ? filteredList.map((l) => ({ list: l }))
        : (
            await Promise.all(
              filteredList.map(async (e) => ({
                list: e,
                cards: await this.trello.getCards(e.id),
              })),
            )
          ).map(({ list, cards }) => ({
            list,
            cards: cards.sort((a, b) => moment(a.due).diff(b.due)),
          }));

    return tasks.map(({ list, cards }) => {
      return {
        title: list.name,
        tasks:
          cards?.map((c) => ({
            title: c.name,
            date: moment(c.due).toDate(),
          })) ?? [],
      };
    });
  }

  async getOutlineTasks(): Promise<TaskList[]> {
    const document = await this.outline.getSettingDocument('todo');
    const root = await OutlineService.parseMarkdown(document.data.text);
    const { toString }: { toString: (input: unknown) => string } =
      await dynamicImport('mdast-util-to-string');
    const {
      toMarkdown,
    }: {
      toMarkdown: (
        input: unknown,
        options: { extensions: unknown[] },
      ) => string;
    } = await dynamicImport('mdast-util-to-markdown');
    const { gfmToMarkdown }: { gfmToMarkdown: () => unknown } =
      await dynamicImport('mdast-util-gfm');
    const lists: TaskList[] = [];

    const stringifyNode = (n: PhrasingContent): string => {
      switch (n.type) {
        case 'text':
          return n.value;
        case 'link':
          return (n.children[0] as Text).value + ` (${n.url})`;
        case 'strong':
          return stringifyNode(n.children[0]);
        default:
          return toMarkdown(n, { extensions: [gfmToMarkdown()] });
      }
    };
    const parseList = (node: List): string[] => {
      return node.children.map((n) => {
        const content = n.children
          .map((c) => {
            const childContent =
              c.type === 'list'
                ? parseList(c)
                    .map((n) => `  ${n}`)
                    .join('\n')
                : (() => {
                    return (c as Paragraph).children
                      .map(stringifyNode)
                      .join('');
                  })();
            return childContent;
          })
          .join('\n');
        return (n.checked ? '- [x] ' : '- [] ') + content;
      });
    };

    root.children.forEach((node) => {
      if (node.type === 'heading') {
        lists.push({ title: toString(node), tasks: [] });
      } else if (node.type === 'list') {
        const currentNode = lists.slice(-1)[0];
        if (!currentNode) return;
        currentNode.tasks = parseList(node).map((t) => {
          const dateTags = /\[(\d+?\/\d+?(?:\/\d+)?)\s?-?\s?(\d+?\/\d+?(?:\/\d+)?)?\]/g.exec(t);
          const [res, start, end] = dateTags ?? []; 
          return {
            title: t,
            date: dateTags ? moment(end || start, ["MM/DD", "MM/DD/YYYY"]).hours(1).toDate() : undefined
          };
        });
      }
    });
    return lists;
  }

  async getTasks(options: { getTaskInfo?: boolean; filter?: string } = {}) {
    const { getTaskInfo = false, filter } = options;
    const trelloTasks = await this.getTrelloTasks(getTaskInfo, filter);
    const tasks = await this.getOutlineTasks();
    return [...tasks, ...trelloTasks];
  }

  async getTaskDeadlines(): Promise<Task[]> {
    const tasks = await this.getTasks();

    const cards = tasks
      .flatMap((c) => c.tasks).filter(t => t.date).flatMap(t => {
        return [
          {
            title: `2 days before ${t.title}`,
            date: moment(t.date).subtract({d:1}).toDate()
          },
          {
            title: `1 day before ${t.title}`,
            date: moment(t.date).subtract({d:1}).toDate()
          },
          {
            title: `1 hour before ${t.title}`,
            date: moment(t.date).subtract({h: 1}).toDate()
          },
          {
            title: `10 minutes before ${t.title}`,
            date: moment(t.date).subtract({m: 10}).toDate()
          },
          t, 
        ]
      })
      .filter(
        (c) => 
          moment(c.date).diff(moment(), 'milliseconds') > 0 &&
          moment(c.date).diff(moment(), 'milliseconds') < 60 * 60 * 24 * 1000,
      );     
    return cards.map((card) => {
      return {
        card: card.title,
        msLeft: moment(card.date).diff(moment(), 'milliseconds'),
        due: card.date,
        name: card.title,
      };
    });
  }
}
