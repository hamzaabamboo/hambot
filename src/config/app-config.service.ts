import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}
  private getEnv<T>(key: string, defaultValue: T): T {
    return this.config.get<T>(key) ?? defaultValue;
  }
  get PUBLIC_URL() {
    return this.getEnv('PUBLIC_URL', '<PUBLIC_URL>');
  }
  get NEXT() {
    const next = this.getEnv('NEXT', 'true');
    return next === 'true';
  }
  get NODE_ENV() {
    return this.getEnv('NODE_ENV', 'Development');
  }
  get PORT() {
    const port = this.getEnv('PORT', '3000');
    return parseInt(port, 10);
  }

  get DISCORD_TOKEN() {
    return this.getEnv('DISCORD_TOKEN', '<DISCORD_TOKEN>');
  }
  get BOT_PREFIX() {
    return this.getEnv('BOT_PREFIX', 'hamB');
  }

  get FACEBOOK_VERIFY_TOKEN() {
    return this.getEnv('FACEBOOK_VERIFY_TOKEN', '<FACEBOOK_VERIFY_TOKEN>');
  }
  get FACEBOOK_PAGE_ACCESS_TOKEN() {
    return this.getEnv(
      'FACEBOOK_PAGE_ACCESS_TOKEN',
      '<FACEBOOK_PAGE_ACCESS_TOKEN>',
    );
  }

  get LINE_CHANNEL_SECRET() {
    return this.getEnv('LINE_CHANNEL_SECRET', '<LINE_CHANNEL_SECRET>');
  }
  get LINE_CHANNEL_ACCESS_TOKEN() {
    return this.getEnv(
      'LINE_CHANNEL_ACCESS_TOKEN',
      '<LINE_CHANNEL_ACCESS_TOKEN>',
    );
  }

  get TRELLO_API_KEY() {
    return this.getEnv('TRELLO_API_KEY', '<TRELLO_API_KEY>');
  }
  get TRELLO_OAUTH_TOKEN() {
    return this.getEnv('TRELLO_OAUTH_TOKEN', '<TRELLO_OAUTH_TOKEN>');
  }

  get TWITTER_BEARER_TOKEN() {
    return this.getEnv('TWITTER_BEARER_TOKEN', '<TWITTER_BEARER_TOKEN>');
  }
  get TWITTER_API_SECRET() {
    return this.getEnv('TWITTER_API_SECRET', '<TWITTER_API_SECRET>');
  }

  get WANIKANI_API_KEY() {
    return this.getEnv('WANIKANI_API_KEY', '<WANIKANI_API_KEY>');
  }

  get AIBOU_SECRET() {
    return this.getEnv('AIBOU_SECRET', '<AIBOU_SECRET>');
  }

  get DATABASE_CONNECTION_URL() {
    return this.getEnv('DATABASE_CONNECTION_URL', '<DATABASE_CONNECTION_URL>');
  }

  get OUTLINE_URL() {
    return this.getEnv('OUTLINE_URL', '<OUTLINE_URL>');
  }

  get OUTLINE_API_TOKEN() {
    return this.getEnv('OUTLINE_API_TOKEN', '<OUTLINE_API_KEY>');
  }

  get OUTLINE_SETTINGS_DOCUMENT_ID() {
    return this.getEnv(
      'OUTLINE_SETTINGS_DOCUMENT_ID',
      '<OUTLINE_SETTINGS_DOCUMENT_ID>',
    );
  }
}
