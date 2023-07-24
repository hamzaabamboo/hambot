import { Injectable } from '@nestjs/common';
import { TwitterService } from 'src/modules/deprecated/twitter/twitter.service';
import { Message } from '../../messages/messages.model';
import { BaseCommand } from '../command.base';

@Injectable()
export class TwitterCommand extends BaseCommand {
  public name = 'twitter';
  public command =
    /^twitter(?: (list|set|remove|refresh|status)(?: ([^\s]+))?(?: (.*))?)?/i;
  public requiresAuth = true;
  constructor(private twitter: TwitterService) {
    super();
  }

  async handle(
    message: Message,
    command: string,
    channel: string,
    rule: string,
  ) {
    switch (command) {
      case 'list':
        const rules = await this.twitter.fetchRules();
        return {
          files: [],
          message: `
            Current Rules (total ${rules.length}):\n${rules
              .map((r) => `${r.tag} - ${r.value}`)
              .join('\n')}
          `,
        };
      case 'set':
        if (!channel && rule) {
          return;
        }
        await this.twitter.track(channel, rule);
        return {
          files: [],
          message: `Updated tag ${channel} to search for ${rule}`,
        };
      case 'remove':
        if (!channel) {
          return;
        }
        await this.twitter.untrack(channel);
        return {
          files: [],
          message: `Removed twitter stream from ${channel}`,
        };
      case 'refresh':
        await this.twitter.refreshStreams();
        return {
          files: [],
          message: `Refreshed Twitter Stream`,
        };
      case 'status':
        const result = this.twitter.getStatus();
        return {
          files: [],
          message: `Twitter Stream status: ${
            result ? 'Active' : 'Disconnected'
          }`,
        };
      default:
        return {
          files: [],
          message:
            'Usage: twitter <list/set/remove/refresh/status> <channel> <rule>',
        };
    }
  }
}
