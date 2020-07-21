import { Channel } from 'discord.js';
import { Readable } from 'stream';

export interface FileWithUrl {
  name?: string;
  url: string;
}
export interface FileWithStream {
  name?: string;
  stream: Readable;
}
export type File = FileWithStream | FileWithUrl;
export interface BaseMessage {
  channel: string;
  senderId: string;
  message: string;
  image?: {
    name?: string;
    url: string;
  };
  files?: File[];
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
