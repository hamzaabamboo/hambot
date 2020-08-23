import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message, FileWithUrl } from '../messages/messages.model';
import { AppLogger } from '../logger/logger';

const SEND_API_URL = 'https://graph.facebook.com/v7.0/me/messages';
@Injectable()
export class FacebookService {
  constructor(private http: HttpService, private config: ConfigService, private logger: AppLogger) {}

  async sendReplyMessage(message: Message) {
    const msg = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      messaging_type: 'RESPONSE',
      recipient: {
        id: message.senderId,
      },
      message: {
        text: message.message,
      },
      attachment: [
        ...(message.image ?? []).map(m => ({
          type: 'image',
          payload: { url: m.url },
        })),
        ...(message.files ?? []).map((m: FileWithUrl) => ({
          type: 'file',
          payload: { url: m.url },
        })),
      ][0],
    };
    await this.http
      .post(
        `${SEND_API_URL}?access_token=${this.config.get(
          'FACEBOOK_PAGE_ACCESS_TOKEN',
        )}`,
        msg,
      )
      .toPromise();
  }

  async sendPushMessage(message: Message) {
    const msg = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      messaging_type: 'MESSAGE_TAG',
      recipient: {
        id: message.channelId,
      },
      message: {
        text: message.message,
      },
      tag: 'CONFIRMED_EVENT_UPDATE',
      attachment: [
        ...(message.image ?? []).map(m => ({
          type: 'image',
          payload: { url: m.url },
        })),
        ...(message.files ?? []).map((m: FileWithUrl) => ({
          type: 'file',
          payload: { url: m.url },
        })),
      ][0],
    };
    try {
      await this.http
        .post(
          `${SEND_API_URL}?access_token=${this.config.get(
            'FACEBOOK_PAGE_ACCESS_TOKEN',
          )}`,
          msg,
        )
        .toPromise();
    } catch (e) {
      this.logger.error(e.response)
    }
  }
}
