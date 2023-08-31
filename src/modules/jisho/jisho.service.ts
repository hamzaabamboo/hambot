import { HttpService } from '@nestjs/axios';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { stat } from 'fs/promises';
import { join } from 'path';
import { Database } from 'sqlite3';
import { AppLogger } from '../logger/logger';

@Injectable()
export class JishoService implements OnApplicationShutdown {
  db: Database;
  isEnabled = false;

  constructor(
    private http: HttpService,
    private logger: AppLogger,
  ) {
    this.initDB();
    this.logger.setContext('JishoService');
  }

  async initDB() {
    try {
      await stat(join(__dirname, '../data/jisho.sqlite'));
      this.logger.log('Loading Jisho Database');
      this.db = new Database(join(__dirname, '../data/jisho.sqlite'));
      this.isEnabled = true;
    } catch {
      this.logger.warn('Database not available, Skipping...');
      this.isEnabled = false;
    }
  }

  onApplicationShutdown(signal?: string) {
    this.db.close();
  }
}
