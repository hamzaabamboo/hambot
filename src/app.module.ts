import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagesModule } from './modules/messages/messages.module';
import { LineModule } from './modules/line/line.module';

@Module({
  imports: [
    MessagesModule,
    LineModule,
    ConfigModule.forRoot({
      expandVariables: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
