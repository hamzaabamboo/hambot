import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { MoreThan, Repository } from 'typeorm';
import { AibouTopic, AibouTopicItem } from './entities/Topic';

@Injectable()
export class AibouService {
  constructor(
    @InjectRepository(AibouTopic)
    private topicRepository: Repository<AibouTopic>,
    @InjectRepository(AibouTopicItem)
    private topicItemRepository: Repository<AibouTopicItem>,
  ) {}

  async fetchNewData(date: number) {
    const d = moment.unix(Math.floor(date / 1000)).toDate();
    return {
      topics: await this.topicRepository.find({
        where: {
          lastUpdatedAt: MoreThan(d),
        },
      }),
      topicItem: (
        await this.topicItemRepository.find({
          where: {
            lastUpdatedAt: MoreThan(d),
          },
        })
      ).map(this.serializeTopicItem),
    };
  }

  async saveNewData(data: {
    topics: AibouTopic[];
    topicItem: (AibouTopicItem & { tags: string[] })[];
  }) {
    const { topics, topicItem } = data;
    await this.topicRepository.save(topics);
    await this.topicItemRepository.save(
      topicItem.map(this.deserializeTopicItem),
    );
  }

  serializeTopicItem(
    data: AibouTopicItem,
  ): AibouTopicItem & { tags: string[] } {
    return {
      ...data,
      tags: JSON.parse(data.tags),
    };
  }

  deserializeTopicItem(
    data: AibouTopicItem & { tags: string[] },
  ): AibouTopicItem {
    return {
      ...data,
      tags: JSON.stringify(data.tags),
    };
  }
}
