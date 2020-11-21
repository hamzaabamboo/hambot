import { Injectable, HttpService, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logger/logger';
import { PushService } from '../push/push.service';
import needle from 'needle';
import qs from 'querystring';
import { Readable } from 'stream';

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
    this.init();
  }

  init() {
    let timeout = 0;
    this.stream = this.streamConnect();
    this.stream.on('timeout', () => {
      // Reconnect on error
      this.logger.warn('A connection error occurred. Reconnecting…');
      setTimeout(() => {
        timeout++;
        this.streamConnect();
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
      stream.on('header', (h) => {
        this.isConnected = true;
        this.logger.verbose('Twitter Stream Connected!');
      });
      stream.on('done', () => {
        this.isConnected = false;
        this.logger.verbose('Twitter Stream Disconnected!');
      });
      stream.on('error', (error) => {
        this.logger.error('Stream Error: ' + JSON.stringify(error));
        if (error.code === 'ETIMEDOUT') {
          this.logger.error('Connection Timedout.');
          stream.emit('timeout');
        }
      });

      return stream;
    } catch (e) {
      this.logger.error('Stream Errored ' + e);
      return this.streamConnect();
    }
  }

  async refresh() {
    this.logger.verbose('Refreshing Streams....');
    const p = new Promise((resolve) => {
      this.logger.verbose('Waiting for stream to disconnect');
      this.stream.request.on('abort', (s) => {
        resolve();
      });
    });
    this.stream.request.abort();
    this.stream.removeAllListeners();
    this.stream.destroy();
    await p;
    this.stream = await this.streamConnect();
  }

  onApplicationShutdown() {
    this.stream.destroy();
  }
}
