import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CommandsModule } from '../commands/commands.module';
import { LineModule } from '../line/line.module';

@Module({
  providers: [MessagesService],
  imports: [CommandsModule, forwardRef(() => LineModule)],
  exports: [MessagesService],
})
export class MessagesModule {}
