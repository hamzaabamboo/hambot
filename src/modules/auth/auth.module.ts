import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TrelloModule } from '../trello/trello.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  providers: [AuthService],
  imports: [TrelloModule, LoggerModule],
  exports: [AuthService],
})
export class AuthModule {}
