import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppConfigService } from 'src/config/app-config.service';
import { setTimeout as sleep } from 'timers/promises';
import { AppLogger } from '../../../src/modules/logger/logger';
import { PushService } from '../../../src/modules/push/push.service';
import {
  TWITTER_DELAY,
  Tweet,
  TwitterRule,
  TwitterStreamService,
} from './twitter-stream.service';
@Injectable()
export class TwitterService {
  rules: TwitterRule[] = [];
  error = 0;

  @Cron('0 0 * * * *')
  refresh() {
    this.refreshStreams();
  }

  constructor(
    private config: AppConfigService,
    private logger: AppLogger,
    private push: PushService,
    private stream: TwitterStreamService,
  ) {
    this.logger.setContext('TwitterService');
    this.initStreams();

    if (this.config.NODE_ENV) {
      this.listen();
    }
  }

  listen() {
    this.stream.stream.on('data', (data) => {
      try {
        const json = JSON.parse(data);
        this.handleTweet(json as Tweet);
        this.error = 0;
      } catch (e) {
        // Keep alive signal received. Do nothing.
      }
    });
    this.stream.stream.on('error', (error) => {
      this.error = this.error + 1;
      if ('connection_issue' in error && this.error < 5) {
        this.logger.debug('Reconnecting, retries : ' + this.error);
        sleep(TWITTER_DELAY).then(() => {
          this.refreshStreams();
        });
      }
    });
  }

  async handleTweet(data: Tweet) {
    data.matching_rules.forEach((r) => {
      const author = data.includes.users.find(
        (u) => u.id === data.data.author_id,
      );
      this.push.push(
        {
          channel: '*',
          message: `@${author.username} tweeted https://twitter.com/${author.username}/status/${data.data.id}`,
        },
        r.tag,
      );
    });
  }

  async initStreams() {
    await this.fetchRules();
  }

  async fetchRules() {
    const { data } = await this.stream.getAllRules();
    this.rules = data ?? [];
    this.logger.verbose(`Listening to ${data?.length ?? 0} rule(s)`);
    return this.rules;
  }

  async track(channel: string, rule: string) {
    if (this.rules.find((r) => r.tag === channel))
      await this.stream.deleteRules(
        this.rules.filter((r) => r.tag === channel).map((e) => e.id),
      );
    const res = await this.stream.setRules([{ value: rule, tag: channel }]);
    const newIds = res.data ?? [];
    if (newIds.length > 0) {
      this.rules = this.rules
        .filter((r) => r.tag !== channel)
        .concat(newIds ?? []);
    }
    await this.refreshStreams();
    return res;
  }

  async untrack(channel: string) {
    const ids = this.rules.filter((r) => r.tag === channel).map((e) => e.id);
    if (ids.length < 1) return;
    const res = await this.stream.deleteRules(ids);
    this.rules = this.rules.filter((r) => r.tag === channel);
    await this.refreshStreams();
    return res;
  }

  async deleteAll(): Promise<void> {
    await this.stream.deleteAllRules({ data: this.rules });
  }

  public async refreshStreams(): Promise<void> {
    await this.stream.refresh();
    this.listen();
  }

  getStatus(): boolean {
    return this.stream.isConnected;
  }
}
