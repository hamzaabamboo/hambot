import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logger/logger';
import { PushService } from '../push/push.service';
import {
  Tweet,
  TwitterRule,
  TwitterStreamService,
} from './twitter-stream.service';
import { Cron } from '@nestjs/schedule';
@Injectable()
export class TwitterService {
  rules: TwitterRule[] = [];

  @Cron('0 0 * * * *')
  refresh() {
    this.refreshStreams();
  }

  constructor(
    private config: ConfigService,
    private logger: AppLogger,
    private push: PushService,
    private stream: TwitterStreamService,
  ) {
    this.initStreams();
    this.listen();
    this.logger.setContext('TwitterService');
  }

  listen() {
    this.stream.stream.on('data', (data) => {
      try {
        const json = JSON.parse(data);
        this.handleTweet(json as Tweet);
      } catch (e) {
        // Keep alive signal received. Do nothing.
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
