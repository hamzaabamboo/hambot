import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagesModule } from './modules/messages/messages.module';
import { LineModule } from './modules/line/line.module';
import { DiscordModule } from './modules/discord/discord.module';
import { QrcodeModule } from './modules/qrcode/qrcode.module';

@Module({
  imports: [
    DiscordModule,
    MessagesModule,
    LineModule,
    QrcodeModule,
    ConfigModule.forRoot({
      expandVariables: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
