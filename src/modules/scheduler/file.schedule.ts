import { Injectable } from '@nestjs/common';

import { Cron } from '@nestjs/schedule';
import { mkdirp } from 'mkdirp';
import path from 'path';
import { rimraf } from 'rimraf';
import { AppLogger } from '../logger/logger';
import { TrelloService } from '../trello/trello.service';

@Injectable()
export class FileSchedule {
  constructor(
    private logger: AppLogger,
    private trello: TrelloService,
  ) {
    this.logger.setContext('FileSchedule');
  }

  @Cron('0 0 * * * *')
  async cleanFiles() {
    this.logger.debug('Cleaning files');
    const board = (await this.trello.getBoards()).find(
      (b) => b.name === 'HamBot',
    );
    const list = (await this.trello.getLists(board.id)).find(
      (l) => l.name === 'files',
    );
    const cards = await this.trello.getCards(list.id);
    await Promise.all(cards.map((c) => this.trello.deleteCard(c.id)));
    const tmpPath = path.join(__dirname, '../../../files/tmp');
    await mkdirp(tmpPath);
    await rimraf(tmpPath);
    this.logger.debug(`Removed ${cards.length} files`);
  }
}
