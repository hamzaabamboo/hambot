import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Table, Text } from 'mdast';
import { dynamicImport } from 'src/utils';
import { AppLogger } from '../logger/logger';
import { OutlineService } from '../outline/outline.service';
import { PushService } from '../push/push.service';
import { TrelloService } from '../trello/trello.service';

interface JobInfo {
  card: string;
  cronTab: string;
  message?: string;
  tags: string;
}
@Injectable()
export class RecurringService {
  private _jobs: string[] = [];

  constructor(
    private outline: OutlineService,
    private trello: TrelloService,
    private scheduler: SchedulerRegistry,
    private push: PushService,
    private logger: AppLogger,
  ) {
    this.logger.setContext('RecurringSchedule');
    this.refresh();
  }
  @Cron('0 0 0 * * *')
  async refresh() {
    await this.clearEvents();
    await this.registerEvents();
  }

  async registerEvents() {
    this.getRecurringEvents().then((cards) => {
      cards.forEach(({ card, cronTab, message, tags }) => {
        try {
          const job = new CronJob(cronTab, () => {
            this.push.push(
              {
                channel: '*',
                senderId: '',
                message,
              },
              tags,
            );
          });
          this.scheduler.addCronJob(card, job);
          job.start();
          this._jobs.push(card);
        } catch {}
      });
      this.logger.debug('Added ' + this._jobs.length + ' recurring events.');
    });
  }

  async clearEvents() {
    if (this._jobs?.length > 0) {
      this._jobs.forEach((j) => this.scheduler.deleteCronJob(j));
      this.logger.debug('Removed ' + this._jobs.length + ' jobs.');
      this._jobs = [];
    }
  }

  private async getTrelloEvents(): Promise<JobInfo[]> {
    const board = (await this.trello.getBoards()).find(
      (b) => b.name === "Ham's Stuff",
    );

    const lists = (await this.trello.getLists(board.id)).filter((list) =>
      list.name.includes('Recurring'),
    );
    const cards = (
      await Promise.all<any[]>(
        lists.map(async (list) => {
          return await this.trello.getCards(list.id);
        }),
      )
    ).flatMap((c) => c);

    const pattern = /\[(.*)\]/;
    const tags = /<(.*)>/i;
    return cards
      .filter((card) => pattern.test(card.name))
      .map((card) => {
        const cronTab = (card.name as string).match(pattern)[1];
        return {
          card: card.name.replace(pattern, ''),
          cronTab,
          message:
            card.desc || card.name.replace(pattern, ' ').replace(tags, ' '),
          tags: card.name.match(tags)?.slice(1)[0],
        };
      });
  }

  private async getOutlineEvents(): Promise<JobInfo[]> {
    const document = await this.outline.getSettingDocument('recurring');
    const root = await OutlineService.parseMarkdown(document.data.text);
    const { toString }: { toString: (input: unknown) => string } =
      await dynamicImport('mdast-util-to-string');
    return root.children
      .filter((c): c is Table => c.type === 'table')
      .flatMap((table: Table) => {
        return table.children
          .slice(1)
          .filter((c) => {
            const cronFormat =
              /(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7})/;
            return cronFormat.test((c.children[0].children[0] as Text)?.value);
          })
          .map((c) => {
            return {
              cronTab: (c.children[0].children[0] as Text)?.value,
              tags: (c.children[1].children[0] as Text)?.value,
              card: (c.children[2].children[0] as Text)?.value,
              message: toString(c.children[3]) || toString(c.children[2]),
            };
          });
      });
  }

  async getRecurringEvents() {
    const trelloEvents = await this.getTrelloEvents();
    const outlineEvents = await this.getOutlineEvents();
    return [...trelloEvents, ...outlineEvents];
  }
}
