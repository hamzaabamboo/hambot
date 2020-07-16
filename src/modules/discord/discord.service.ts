import { Injectable } from '@nestjs/common';
import {
  Client,
  Channel,
  DMChannel,
  TextChannel,
  MessageOptions,
} from 'discord.js';

@Injectable()
export class DiscordService {
  private client: Client;
  constructor() {
    this.client = new Client();
  }

  async sendMessage(channel: Channel, message: MessageOptions) {
    const c = await this.client.channels.fetch(channel.id);
    switch (c.type) {
      case 'dm':
        await (c as DMChannel).send(message);
        break;
      case 'text':
        await (c as TextChannel).send(message);
        break;
    }
  }

  get getClient() {
    return this.client;
  }
}
