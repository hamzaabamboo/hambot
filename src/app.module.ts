import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app-config.module';
import { AppConfigService } from './config/app-config.service';
import {
  AibouModule,
  AibouSettings,
  AibouTopic,
  AibouTopicItem,
} from './modules/aibou/aibou.module';
import { AudioModule } from './modules/audio/audio.module';
import { D4DJModule } from './modules/d4dj/d4dj.module';
import { DiscordModule } from './modules/discord/discord.module';
import { FacebookModule } from './modules/facebook/facebook.module';
import { FileModule } from './modules/file/file.module';
import { IcalModule } from './modules/ical/ical.module';
import { JishoModule } from './modules/jisho/jisho.module';
import { LineModule } from './modules/line/line.module';
import { MessagesModule } from './modules/messages/messages.module';
import { OutlineModule } from './modules/outline/outline.module';
import { QrcodeModule } from './modules/qrcode/qrcode.module';
import { RssModule } from './modules/rss/rss.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { WanikaniModule } from './modules/wanikani/wanikani.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { ABCFortuneModule } from './modules/abc-fortune/abc-fortune.module';
import { GeminiModule } from './modules/gemini/gemini.module';

@Module({
  imports: [
    DiscordModule,
    MessagesModule,
    LineModule,
    QrcodeModule,
    SchedulerModule,
    FileModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      expandVariables: true,
    }),
    AppConfigModule,
    FacebookModule,
    AudioModule,
    RssModule,
    IcalModule,
    WanikaniModule,
    OutlineModule,
    D4DJModule,
    AibouModule,
    JishoModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService) => ({
        type: 'postgres',
        url: configService.DATABASE_CONNECTION_URL,
        entities: [AibouTopic, AibouTopicItem, AibouSettings],
        synchronize: true,
      }),
      inject: [AppConfigService],
    }),
    OutlineModule,
    WebhookModule,
    ABCFortuneModule,
    GeminiModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
