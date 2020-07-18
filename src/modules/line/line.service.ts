import { Injectable } from '@nestjs/common';
import { Client } from '@line/bot-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LineService {
  private _lineClient = new Client({
    channelAccessToken: this.config.get('LINE_CHANNEL_ACCESS_TOKEN'),
    channelSecret: this.config.get('LINE_CHANNEL_SECRET'),
  });

  constructor(private config: ConfigService) {}
  sendReplyMessage(
    message: Parameters<Client['replyMessage']>[1],
    token: string,
  ) {
    return this._lineClient.replyMessage(token, message);
  }

  getContent(messageId: string) {
    return this._lineClient.getMessageContent(messageId);
  }
}
