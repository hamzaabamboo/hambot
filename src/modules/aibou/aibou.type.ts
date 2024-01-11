import { AibouTopic, AibouTopicItem } from './aibou.module';

export type AibouData = {
  topics: AibouTopic[];
  topicItem: (AibouTopicItem & { tags: string[] })[];
  timestamp: number;
};
