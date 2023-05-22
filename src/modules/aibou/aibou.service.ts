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
    timestamp: number;
  }) {
    const { topics, topicItem, timestamp } = data;
    const lastUpdatedAt = moment.unix(Math.floor(timestamp / 1000)).toDate();
    await this.topicRepository.save(
      topics.map((t) => ({ ...t, lastUpdatedAt })),
    );
    await this.topicItemRepository.save(
      topicItem
        .map(this.deserializeTopicItem)
        .map((t) => ({ ...t, lastUpdatedAt })),
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
