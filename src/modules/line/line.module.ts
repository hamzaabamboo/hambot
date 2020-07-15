import { Module, forwardRef } from '@nestjs/common';
import { LineController } from './line.controller';
import { LineService } from './line.service';
import { ConfigModule } from '@nestjs/config';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [ConfigModule, forwardRef(() => MessagesModule)],
  controllers: [LineController],
  providers: [LineService],
  exports: [LineService],
})
export class LineModule {}
