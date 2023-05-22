import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagesModule } from './modules/messages/messages.module';
import { LineModule } from './modules/line/line.module';
import { DiscordModule } from './modules/discord/discord.module';
import { QrcodeModule } from './modules/qrcode/qrcode.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { AudioModule } from './modules/audio/audio.module';
import { FileModule } from './modules/file/file.module';
import { TwitterModule } from './modules/twitter/twitter.module';
import { FacebookModule } from './modules/facebook/facebook.module';
import { RssModule } from './modules/rss/rss.module';
import { IcalModule } from './modules/ical/ical.module';
import { WanikaniModule } from './modules/wanikani/wanikani.module';
import { D4DJModule } from './modules/d4dj/d4dj.module';
import { CovidModule } from './modules/covid/covid.module';
import {
  AibouModule,
  AibouSettings,
  AibouTopic,
  AibouTopicItem,
} from './modules/aibou/aibou.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from './config/app-config.module';

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
    TwitterModule,
    AudioModule,
    RssModule,
    IcalModule,
    WanikaniModule,
    D4DJModule,
    CovidModule,
    AibouModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: '../files/database.db',
      entities: [AibouTopic, AibouTopicItem, AibouSettings],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
