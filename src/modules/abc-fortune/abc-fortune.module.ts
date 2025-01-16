import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from 'src/config/app-config.module';
import { LoggerModule } from '../logger/logger.module';
import { PushModule } from '../push/push.module';
import { S3Module } from '../s3/s3.module';
import { ABCFortuneController } from './abc-fortune.controller';
import { ABCFortuneService } from './abc-fortune.service';

@Module({
  imports: [ConfigModule, PushModule, AppConfigModule, S3Module, LoggerModule],
  providers: [ABCFortuneService],
  controllers: [ABCFortuneController],
  exports: [ABCFortuneService],
})
export class ABCFortuneModule {}
