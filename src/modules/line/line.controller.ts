import {
  Controller,
  Post,
  Body,
  Headers,
  Inject,
  forwardRef,
} from '@nestjs/common';
import * as crypto from 'crypto';
import {
  TextMessage,
  WebhookRequestBody,
  FileEventMessage,
  TextEventMessage,
} from '@line/bot-sdk';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages/messages.service';
import { LineService } from './line.service';

@Controller('line')
export class LineController {
  public prefix = /^hamB (.*)$/;

  constructor(
    @Inject(forwardRef(() => MessagesService))
    private messageService: MessagesService,
    private lineService: LineService,
    private config: ConfigService,
  ) {}
  @Post()
  handleMessage(
    @Body() message: WebhookRequestBody,
    @Headers('x-line-signature') lineSignature: string,
  ) {
    if (this.getBodySignature(message) !== lineSignature) return;
    Promise.all(
      message.events.map(async evt => {
        switch (evt.type) {
          case 'message':
            const msg = evt.message;
            switch (evt.message.type) {
              case 'text':
                if (evt.source.type !== 'user') {
                  if (!this.prefix.test((msg as TextEventMessage).text)) return;
                  return this.messageService.handleMessage({
                    channel: 'line',
                    senderId: evt.source.userId,
                    message: this.prefix.exec(
                      (msg as TextEventMessage).text,
                    )[1],
                    replyToken: evt.replyToken,
                  });
                }
                return this.messageService.handleMessage({
                  channel: 'line',
                  senderId: evt.source.userId,
                  message: (evt.message as TextEventMessage).text,
                  replyToken: evt.replyToken,
                });
              case 'file':
                const content = await this.lineService.getContent(msg.id);
            }
          default:
        }
      }),
    );
    return {
      message: 'Success',
    };
  }

  getBodySignature(body: WebhookRequestBody) {
    return crypto
      .createHmac('SHA256', this.config.get('LINE_CHANNEL_SECRET'))
      .update(JSON.stringify(body))
      .digest('base64');
  }
}
