import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
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
import { AppConfigService } from './config/app-config.service';


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
    ThrottlerModule.forRoot([  {
      name: 'short',
      ttl: 1000,
      limit: 3,
    },
    {
      name: 'medium',
      ttl: 10000,
      limit: 20
    },
    {
      name: 'long',
      ttl: 60000,
      limit: 100
    }]),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService) => ({
        type: 'postgres',
        host: configService.DATABASE_HOST,
        port: +configService.DATABASE_PORT,
        username: configService.DATABASE_USER,
        password: configService.DATABASE_PASSWORD,
        database: configService.DATABASE_NAME,
        entities: [AibouTopic, AibouTopicItem, AibouSettings],
        synchronize: true,
      }),
      inject: [AppConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
