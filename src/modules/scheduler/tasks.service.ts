import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import moment from 'moment';
import { AppLogger } from '../logger/logger';
import { PushService } from '../push/push.service';
import { TrelloService } from '../trello/trello.service';
import { Paragraph, Text, List, PhrasingContent } from 'mdast';
import { OutlineService } from '../outline/outline.service';
import { dynamicImport } from 'src/utils';
import { TaskList, Task as TodoTask } from './task.type';
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
  async update() {
    if (this._jobs.length > 0) {
      this._jobs.forEach((j) => {
        try {
          this.scheduler.deleteTimeout(j);
        } catch (e) {
          this.logger.error('Something went wrong: ' + e);
        }
      });
      this.logger.debug('Removed ' + this._jobs.length + ' jobs.');
      this._jobs = [];
    }
    const deadlines = await this.registerEvents();
    return deadlines;
  }

  async registerEvents() {
    const cards = await this.getTaskDeadlines();
    cards.forEach(({ card, msLeft, name }) => {
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

    return cards.length;
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
        currentNode.tasks = parseList(node)
          .map((t) => {
            const dateTags =
              /\[(\d+?\/\d+?(?:\/\d+)?(?:\s?\d{1,2}[:.]\d{1,2})?)\s?-?\s?(\d+?\/\d+?(?:\/\d+)?(?:\s?\d{1,2}[:.]\d{1,2})?)?\]/g.exec(
                t,
              );
            const [res, start, end] = dateTags ?? [];
            if (!start && !end) return undefined;
            const startTime = start
              ? moment(start, [
                  'MM/DD',
                  'MM/DD/YYYY',
                  'MM/DD HH:mm',
                  'MM/DD/YYYY HH:mm',
                ]).toDate()
              : undefined;
            const endTime = end
              ? moment(end, [
                  'MM/DD',
                  'MM/DD/YYYY',
                  'MM/DD HH:mm',
                  'MM/DD/YYYY HH:mm',
                ]).toDate()
              : undefined;
            return {
              title: t,
              start: startTime,
              end: endTime,
            } satisfies TodoTask;
          })
          .filter((t) => !!t);
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
      .flatMap((c) => c.tasks)
      .filter((t) => t.start || t.end)
      .flatMap((t) => {
        const startTime = [
          {
            title: `2 days before ${t.title} starts`,
            start: moment(t.start).subtract({ d: 2 }).toDate(),
          },
          {
            title: `1 day before ${t.title} starts`,
            start: moment(t.start).subtract({ d: 1 }).toDate(),
          },
          {
            title: `1 hour before ${t.title} starts`,
            start: moment(t.start).subtract({ h: 1 }).toDate(),
          },
          {
            title: `10 minutes before ${t.title} starts`,
            start: moment(t.start).subtract({ m: 10 }).toDate(),
          },
          t,
        ];

        const endTime = t.end
          ? [
              {
                title: `2 days before ${t.title} ends`,
                start: moment(t.end).subtract({ d: 2 }).toDate(),
              },
              {
                title: `1 day before ${t.title} ends`,
                start: moment(t.end).subtract({ d: 1 }).toDate(),
              },
              {
                title: `1 hour before ${t.title} ends`,
                start: moment(t.end).subtract({ h: 1 }).toDate(),
              },
              {
                title: `10 minutes before ${t.title} ends`,
                start: moment(t.end).subtract({ m: 10 }).toDate(),
              },
              {
                ...t,
                title: `${t.title} ends`,
              },
            ]
          : [];

        return [...startTime, ...endTime];
      })
      .filter(
        (c) =>
          moment(c.start).diff(moment(), 'milliseconds') > 0 &&
          moment(c.start).diff(moment(), 'milliseconds') < 60 * 60 * 24 * 1000,
      );
    return cards.map((card) => {
      return {
        card: card.title,
        msLeft: moment(card.start).diff(moment(), 'milliseconds'),
        due: card.start,
        name: card.title,
      };
    });
  }
}
