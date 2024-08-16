import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { PushModule } from 'src/modules/push/push.module';

@Module({
  controllers: [WebhookController],
  imports: [PushModule],
})
export class WebhookModule {}
