import {
  Controller,
  Post,
  Body,
  Headers,
  Inject,
  forwardRef,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { TextMessage, WebhookRequestBody } from '@line/bot-sdk';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages/messages.service';

@Controller('line')
export class LineController {
  constructor(
    @Inject(forwardRef(() => MessagesService))
    private messageService: MessagesService,
    private config: ConfigService,
  ) {}
  @Post()
  handleMessage(
    @Body() message: WebhookRequestBody,
    @Headers('x-line-signature') lineSignature: string,
  ) {
    if (this.getBodySignature(message) !== lineSignature) return;

    return Promise.all(
      message.events.map(evt => {
        switch (evt.type) {
          case 'message':
            return this.messageService.handleMessage({
              channel: 'line',
              senderId: evt.source.userId,
              message: (evt.message as TextMessage).text,
              replyToken: evt.replyToken,
            });
          default:
        }
      }),
    );
  }

  getBodySignature(body: WebhookRequestBody) {
    return crypto
      .createHmac('SHA256', this.config.get('LINE_CHANNEL_SECRET'))
      .update(JSON.stringify(body))
      .digest('base64');
  }
}
