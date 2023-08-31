import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app-config.module';
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
import { QrcodeModule } from './modules/qrcode/qrcode.module';
import { RssModule } from './modules/rss/rss.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { WanikaniModule } from './modules/wanikani/wanikani.module';

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
    D4DJModule,
    AibouModule,
    JishoModule,
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
