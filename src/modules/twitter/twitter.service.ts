import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const TWITTER_BASE_URL =
  'https://api.twitter.com/1.1/account_activity/all/prod/';

@Injectable()
export class TwitterService {
  constructor(private config: ConfigService, private http: HttpService) {
    // this.getWebhooks().then(console.log);
  }

  async getWebhooks() {
    return this.http.get(TWITTER_BASE_URL + 'webhooks');
  }
}
