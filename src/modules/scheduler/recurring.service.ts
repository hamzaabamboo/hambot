import { Injectable, LoggerService } from '@nestjs/common';
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
    this.update();
  }
  @Cron('0 0 0 * * *')
  update() {
    if (this._jobs.length > 0) {
      this._jobs.forEach(j => this.scheduler.deleteCronJob(j));
      this.logger.debug('Removed ' + this._jobs.length + ' jobs.');
      this._jobs = [];
    }
    this.registerEvents();
  }

  async registerEvents() {
    this.getRecurringEvents().then(cards => {
      cards.forEach(({ card, cronTab, message }) => {
        const job = new CronJob(cronTab, () => {
          this.push.push({
            channel: '*',
            senderId: '',
            message,
          });
        });
        this.scheduler.addCronJob(card, job);
        job.start();
      });
      this._jobs = cards.map(c => c.card);
      this.logger.debug('Added ' + cards.length + ' recurring events.');
    });
  }

  async getRecurringEvents() {
    const board = (await this.trello.getBoards()).find(
      b => b.name === "Ham's Stuff",
    );

    const list = (await this.trello.getLists(board.id)).find(
      list => list.name === 'Recurring',
    );

    const cards = await this.trello.getCards(list.id);
    const pattern = /\[(.*)\]/;
    const privateCard = /<Private>/i;
    return cards
      .filter(card => pattern.test(card.name) && !privateCard.test(card.name))
      .map(card => {
        const cronTab = (card.name as string).match(pattern)[1];
        return {
          card: card.name.replace(pattern, ''),
          cronTab,
          message: card.desc,
        };
      });
  }
}
