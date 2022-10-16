import { Module } from '@nestjs/common';
import { AibouService } from './aibou.service';
import { AibouController } from './aibou.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AibouTopic, AibouTopicItem } from './entities/Topic';
import { AibouSettings } from './entities/Settings';

@Module({
  imports: [
    TypeOrmModule.forFeature([AibouTopic, AibouTopicItem, AibouSettings]),
  ],
  providers: [AibouService],
  controllers: [AibouController],
  exports: [TypeOrmModule],
})
export class AibouModule {}

export { AibouTopic, AibouTopicItem, AibouSettings };
