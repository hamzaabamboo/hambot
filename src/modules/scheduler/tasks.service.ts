import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import moment from 'moment';
import { AppLogger } from '../logger/logger';
import { PushService } from '../push/push.service';
import { TrelloService } from '../trello/trello.service';

@Injectable()
export class TaskSchedule {
  private _jobs: string[] = [];

  constructor(
    private trello: TrelloService,
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

  async getTaskDeadlines() {
    const board = (await this.trello.getBoards()).find(
      (b) => b.name === "Ham's Stuff",
    );

    const list = await this.trello.getLists(board.id);

    const cards = (
      await Promise.all(list.map((l) => this.trello.getCards(l.id)))
    )
      .flatMap((e) => e)
      .filter(
        (c: any) =>
          c.due &&
          moment(c.due).diff(moment(), 'milliseconds') > 0 &&
          moment(c.due).diff(moment(), 'milliseconds') < 60 * 60 * 24 * 1000,
      );
    return cards.map((card: any) => {
      return {
        card: card.id,
        msLeft: moment(card.due).diff(moment(), 'milliseconds'),
        due: card.due,
        name: card.name,
      };
    });
  }
}
