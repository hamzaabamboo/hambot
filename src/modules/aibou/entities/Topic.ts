import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class AibouTopic {
  @PrimaryColumn()
  id: string;
  @Column()
  name: string;
  @Column({ nullable: true })
  description?: string;
  @Column()
  createdAt: Date;
  @Column()
  lastUpdatedAt: Date;
  @Column({ default: false })
  isDeleted: boolean;
}

@Entity()
export class AibouTopicItem {
  @PrimaryColumn()
  id: string;
  @Column()
  topicId: string;
  @Column()
  word: string;
  @Column({ nullable: true })
  notes?: string;
  @Column()
  tags: string;
  @Column()
  createdAt: Date;
  @Column()
  lastUpdatedAt: Date;
  @Column({ default: false })
  isDeleted: boolean;
}
