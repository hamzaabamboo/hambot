import { Module } from '@nestjs/common';
import { AibouService } from './aibou.service';
import { AibouController } from './aibou.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AibouTopic, AibouTopicItem } from './entities/Topic';
import { AibouSettings } from './entities/Settings';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from 'src/config/app-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AibouTopic, AibouTopicItem, AibouSettings]),
    ConfigModule,
  ],
  providers: [AibouService, AppConfigService],
  controllers: [AibouController],
  exports: [TypeOrmModule],
})
export class AibouModule {}

export { AibouTopic, AibouTopicItem, AibouSettings };
