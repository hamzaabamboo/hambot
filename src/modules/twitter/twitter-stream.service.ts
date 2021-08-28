import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logger/logger';
import { PushService } from '../push/push.service';
import needle from 'needle';
import qs from 'querystring';
import { Readable } from 'stream';
import { sleep } from 'src/utils/sleep';

export interface TwitterRule {
  id?: string;
  value: string;
  tag: string;
}

export interface Tweet {
  data: {
    id: string;
    attachments?: { media_keys: string[] };
    text: string;
    author_id: string;
  };
  includes: {
    users: {
      username: string;
      id: string;
      name: string;
    }[];
    media?: {
      id: string;
      url: string;
    }[];
  };
  matching_rules: TwitterRule[];
}

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream';

export const TWITTER_DELAY = 15000;
@Injectable()
export class TwitterStreamService implements OnApplicationShutdown {
  public stream: Readable | any;
  public isConnected = false;
  constructor(
    private config: ConfigService,
    private logger: AppLogger,
    private http: HttpService,
    private push: PushService,
  ) {
    this.logger.setContext('TwitterStreamService');

    if (this.config.get('NODE_ENV')) {
      this.init();
    }
  }

  init() {
    let timeout = 0;
    this.stream = this.streamConnect();
    this.stream.on('timeout', () => {
      // Reconnect on error
      this.logger.warn('A connection error occurred. Reconnecting…');
      setTimeout(() => {
        timeout++;
        this.stream = this.streamConnect();
      }, 2 ** timeout);
    });
  }

  async getAllRules(): Promise<{ data: TwitterRule[] }> {
    const response = await this.http
      .get(rulesURL, {
        headers: {
          authorization: `Bearer ${this.config.get('TWITTER_BEARER_TOKEN')}`,
        },
      })
      .toPromise();

    if (response.status !== 200) {
      return null;
    }

    return response.data;
  }

  async deleteAllRules(rules: { data: TwitterRule[] }) {
    if (!Array.isArray(rules?.data)) {
      return null;
    }

    const ids = rules.data.map((rule) => rule.id);

    const data = {
      delete: {
        ids: ids,
      },
    };

    const response = await this.http
      .post(rulesURL, data, {
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.config.get('TWITTER_BEARER_TOKEN')}`,
        },
      })
      .toPromise();

    if (response.status !== 200) {
      return null;
    }

    return response.data;
  }

  async deleteRules(ids: string[]) {
    const data = {
      delete: {
        ids: ids,
      },
    };

    const response = await this.http
      .post(rulesURL, data, {
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.config.get('TWITTER_BEARER_TOKEN')}`,
        },
      })
      .toPromise();

    if (response.status !== 200) {
      return null;
    }

    return response.data;
  }

  async setRules(rules: TwitterRule[]) {
    const data = {
      add: rules,
    };

    const response = await this.http
      .post(rulesURL, data, {
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.config.get('TWITTER_BEARER_TOKEN')}`,
        },
      })
      .toPromise();

    if (response.status !== 201) {
      return null;
    }

    return response.data;
  }

  streamConnect(): any {
    //Listen to the stream
    // const options = {
    //   timeout: 20000,
    // };

    try {
      const stream = needle.get(
        streamURL +
          '?' +
          qs.stringify({
            expansions: 'author_id,attachments.media_keys',
            'user.fields': 'username,id,name',
            'tweet.fields': 'public_metrics',
            'media.fields': 'url',
          }),
        {
          headers: {
            Authorization: `Bearer ${this.config.get('TWITTER_BEARER_TOKEN')}`,
          },
        },
      );

      stream.on('error', (error) => {
        this.isConnected = false;
        this.logger.error('Stream Errored: ' + JSON.stringify(error));
        if (error.code === 'ETIMEDOUT') {
          this.logger.error('Connection Timed out.');
          stream.emit('timeout');
        }
      });

      stream.on('header', (h) => {
        this.isConnected = true;
        this.logger.verbose('Twitter Stream Connected!');
      });
      stream.on('done', (e) => {
        this.isConnected = false;
        this.logger.verbose('Twitter Stream Disconnected!');
      });
      stream.on('data', (e: any) => {
        try {
          const f = JSON.parse(e as string);
          if (!('data' in f)) this.logger.debug('Data: ' + JSON.stringify(f));
        } catch {}
        if ('connection_issue' in e) {
          stream.emit('error', e);
        }
      });

      return stream;
    } catch {}
  }

  async refresh() {
    this.logger.verbose('Refreshing Streams....');
    if (this.isConnected) {
      const p = new Promise((resolve) => {
        this.logger.verbose('Waiting for stream to disconnect...');
        this.stream.request.on('abort', (s) => {
          this.logger.verbose('Disconnected!');
          this.isConnected = false;
          resolve(null);
        });
      });
      this.stream.request.abort();
      this.stream.removeAllListeners();
      this.stream.destroy();
      await p;
      this.logger.verbose('Wait 15 seconds.');
      await sleep(15000);
    }
    this.stream = await this.streamConnect();
  }

  onApplicationShutdown() {
    try {
      this.stream.destroy();
    } catch {}
  }
}
