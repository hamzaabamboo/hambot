import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { PushService } from '../push/push.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from 'src/config/app-config.service';
import { BaseMessage, Message, PushMessage } from '../messages/messages.model';

type WebhookPushMessage = {
  data: PushMessage;
  channel: string;
};
@Controller('webhook')
export class WebhookController {
  constructor(
    private push: PushService,
    private config: AppConfigService,
  ) {}

  @Post('/hambot-push')
  async syncData(
    @Body() body: WebhookPushMessage,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    if (req.headers['x-hambot-key'] !== this.config.HAMBOT_KEY) {
      return res.status(401).send('Not Authorized');
    }
    const { data, channel } = body;

    if (!data || !channel) {
      res
        .status(400)
        .send({ success: false, message: 'Invalid data or channel' });
      return;
    }

    await this.push.push(
      {
        channel: 'push',
        ...data,
      },
      channel,
    );

    res.status(200).send({ success: true });
  }
}
