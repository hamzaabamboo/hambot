import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { TrelloService } from '../trello/trello.service';
import { AppLogger } from '../logger/logger';
import { PushService } from '../push/push.service';

@Injectable()
export class RecurringService {
  private _jobs: string[] = [];

  constructor(
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

  async getRecurringEvents() {
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
}
