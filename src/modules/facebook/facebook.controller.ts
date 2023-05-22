import {
  Controller,
  Get,
  Body,
  HttpException,
  Post,
  Query,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { AppLogger } from '../logger/logger';
import { MessagesService } from '../messages/messages.service';
import path from 'path';
import { AppConfigService } from 'src/config/app-config.service';

interface FacebookEvent {
  messaging: {
    sender: { id: string };
    recipient: { id: string };
    timestamp: string;
    message: {
      mid: string;
      text?: string;
      attachments?: { type: string; payload: { url: string } }[];
    };
  }[];
}

@Controller('facebook')
export class FacebookController {
  constructor(
    private config: AppConfigService,
    private logger: AppLogger,
    @Inject(forwardRef(() => MessagesService))
    private message: MessagesService,
  ) {
    this.logger.setContext('FacebookController');
  }
  @Post('/')
  handleWebhook(@Body() body: any) {
    // Checks this is an event from a page subscription
    if (body.object === 'page') {
      // Iterates over each entry - there may be multiple if batched

      body.entry.forEach((entry: FacebookEvent) => {
        // Gets the message. entry.messaging is an array, but
        // will only ever contain one message, so we get index 0
        const msgs = entry.messaging;

        msgs.forEach((m) => {
          this.message.handleMessage({
            senderId: m.sender.id,
            channelId: m.sender.id,
            channel: 'facebook',
            message: m.message.text,
            image: m.message.attachments
              ?.filter((e) => e.type === 'image')
              .map((e) => ({
                name: path.basename(e.payload.url).split('?')[0],
                url: e.payload.url,
              })),
            files: m.message.attachments
              ?.filter((e) => e.type !== 'image')
              .map((e) => ({
                name: path.basename(e.payload.url).split('?')[0],
                url: e.payload.url,
              })),
          });
        });
      });

      // Returns a '200 OK' response to all requests
      return 'EVENT_RECEIVED';
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      return new HttpException('not found', 404);
    }
  }

  @Get('/')
  handleVerify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === this.config.FACEBOOK_VERIFY_TOKEN) {
        // Responds with the challenge token from the request
        this.logger.debug('Webhook Verified');
        return challenge;
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        return new HttpException('Invalid token', 403);
      }
    }
  }
}
