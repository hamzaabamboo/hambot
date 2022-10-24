import { Injectable } from '@nestjs/common';
import { Client } from '@line/bot-sdk';
import { AppConfigService } from 'src/config/app-config.service';

@Injectable()
export class LineService {
  private _lineClient = new Client({
    channelAccessToken: this.config.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: this.config.LINE_CHANNEL_SECRET,
  });

  constructor(private config: AppConfigService) { }
  sendReplyMessage(
    message: Parameters<Client['replyMessage']>[1],
    token: string,
  ) {
    return this._lineClient.replyMessage(token, message);
  }

  sendPushMessage(
    message: Parameters<Client['replyMessage']>[1],
    receiver: string,
  ) {
    return this._lineClient.pushMessage(receiver, message);
  }

  getContent(messageId: string) {
    return this._lineClient.getMessageContent(messageId);
  }
}
