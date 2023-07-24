import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { TrelloService } from '../trello/trello.service';
import { AppLogger } from '../logger/logger';
import { PushService } from '../push/push.service';
import { IcalService } from '../ical/ical.service';
import moment from 'moment';
import { CalendarEvent } from '../ical/events.model';

@Injectable()
export class CalendarSchedule {
  private _jobs: string[] = [];

  constructor(
    private trello: TrelloService,
    private scheduler: SchedulerRegistry,
    private ical: IcalService,
    private push: PushService,
    private logger: AppLogger,
  ) {
    this.logger.setContext('CalendarSchedule');
    this.refresh();
  }
  @Cron('0 0 0 * * *')
  async refresh() {
    this.logger.verbose('Refreshing Calendar Events');
    await this.clearEvents();
    await this.registerEvents();
  }

  async registerEvents() {
    this.getEvents().then((event) => {
      event.forEach(({ card, startTime, tags, title, description, id }) => {
        try {
          const msLeft = moment(startTime).diff(moment(), 'milliseconds');
          if (msLeft - 3600000 > 0) {
            const pre = setTimeout(() => {
              this.push.push(
                {
                  channel: '*',
                  senderId: '',
                  message:
                    `Event from '${card.trim()}' calendar: \n` +
                    `${title} \n` +
                    `${
                      description?.trim() ||
                      `happening in ${moment(startTime).fromNow()}`
                    }
                      `,
                },
                tags,
              );
            }, msLeft - 3600000);
            this.scheduler.addTimeout(`${card}-${id}-pre`, pre);
            this._jobs.push(`${card}-pre`);
          }
          const job = setTimeout(() => {
            this.push.push(
              {
                channel: '*',
                senderId: '',
                message:
                  `Event from '${card.trim()}' calendar: \n` +
                  `${title} \n` +
                  `${
                    description?.trim() ||
                    `happening in ${moment(startTime).fromNow()}`
                  }
                      `,
              },
              tags,
            );
          }, msLeft);

          this.scheduler.addTimeout(`${card}-${id}`, job);
          this._jobs.push(card);
        } catch {}
      });
      this.logger.debug('Added ' + this._jobs.length + ' calendar job(s).');
    });
  }

  async clearEvents() {
    if (this._jobs?.length > 0) {
      this._jobs.forEach((j) => this.scheduler.deleteCronJob(j));
      this.logger.debug('Removed ' + this._jobs.length + ' calendar job(s).');
      this._jobs = [];
    }
  }
  async getEvents() {
    const calendars = await this.getCalendars();
    const events = (
      await Promise.all(
        calendars.map(async (c) => {
          try {
            return (await this.ical.getCalenderData(c.url))
              .filter(
                (c) =>
                  moment(c.startTime).isAfter(moment()) &&
                  moment(c.startTime).diff(moment(), 'days') < 1,
              )
              .map(
                (r) =>
                  ({
                    ...r,
                    tags: c.tags,
                    calendar: c.calendar,
                    card: c.card,
                  }) as CalendarEvent & {
                    tags?: string;
                    calendar?: string;
                    card?: string;
                  },
              );
          } catch (error) {
            this.logger.error(error.message);
            return [];
          }
        }),
      )
    ).flatMap((c) => c);
    return events;
  }

  async getCalendars() {
    const board = (await this.trello.getBoards()).find(
      (b) => b.name === 'HamBot',
    );

    const lists = (await this.trello.getLists(board.id)).filter((list) =>
      list.name.includes('Calendars'),
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
        const calendar = (card.name as string).match(pattern)[1];
        return {
          card: card.name.replace(pattern, '').replace(tags, ''),
          url: card.desc,
          calendar: calendar,
          tags: card.name.match(tags)?.slice(1)[0],
        };
      });
  }
}
