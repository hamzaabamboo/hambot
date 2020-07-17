import { Channel } from 'discord.js';

export interface BaseMessage {
  channel: string;
  senderId: string;
  message: string;
  image?: {
    name?: string;
    url: string;
  };
}
export interface LineMessage extends BaseMessage {
  channel: 'line';
  replyToken?: string;
}

export interface DiscordMessage extends BaseMessage {
  channel: 'discord';
  messageChannel?: Channel;
}

export type Message = LineMessage | DiscordMessage;
