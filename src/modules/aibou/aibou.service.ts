import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AibouTopic, AibouTopicItem } from './entities/Topic';

@Injectable()
export class AibouService {
  constructor(
    @InjectRepository(AibouTopic)
    private topicRepository: Repository<AibouTopic>,
    @InjectRepository(AibouTopicItem)
    private topicItemRepository: Repository<AibouTopicItem>,
  ) {}

  async fetchEverything() {
    return {
      topic: await this.topicRepository.find(),
      topicItem: await this.topicItemRepository.find(),
    };
  }

  async saveNewData(data: {
    topics: AibouTopic[];
    topicItem: AibouTopicItem[];
  }) {
    const { topics, topicItem } = data;
    await this.topicRepository.save(topics);
    await this.topicItemRepository.save(topicItem);
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
