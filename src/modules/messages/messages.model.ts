import {
  Channel,
  MessageEmbed,
  Message as RawDiscordMessage,
  TextBasedChannels,
} from 'discord.js';
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

export type MessageChannel = 'facebook' | 'line' | 'discord' | '*';
export interface BaseMessage {
  senderId?: string;
  channelId?: string;
  message: string;
  image?: {
    name?: string;
    url: string;
  }[];
  files?: File[];
}
export interface LineMessage extends BaseMessage {
  channel: 'line';
  replyToken?: string;
  pushTo?: string;
}

export interface DiscordMessage extends BaseMessage {
  channel: 'discord';
  discordMessage?: RawDiscordMessage;
  messageChannel?: TextBasedChannels;
  destination?: Channel;
  embeds?: MessageEmbed;
}

export interface FacebookMessage extends BaseMessage {
  channel: 'facebook';
}

export interface BroadcastMessage extends BaseMessage {
  channel: '*';
}

export type Message =
  | FacebookMessage
  | LineMessage
  | DiscordMessage
  | BroadcastMessage;
