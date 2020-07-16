import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TrelloModule } from '../trello/trello.module';

@Module({
  providers: [AuthService],
  imports: [TrelloModule],
  exports: [AuthService],
})
export class AuthModule {}
