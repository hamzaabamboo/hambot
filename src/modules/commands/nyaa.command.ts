import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import { RssService } from '../rss/rss.service';
import he from 'he';

const PER_PAGE = 10;
@Injectable()
export class NyaaCommand extends BaseCommand {
  public name = 'nyaa';
  public command = /^nyaa(?: (\d+))?(?: (.*))?/i;
  public requiresAuth = true;
  clipboard: string;

  constructor(private rss: RssService) {
    super();
  }

  async handle(message: Message, page: string, query: string) {
    if (!query) {
      return {
        files: [],
        message: 'Usage: nyaa <page?> <query>',
      };
    }
    const url = `https://nyaa.si/?f=0&c=0_0&q=${encodeURIComponent(
      query ?? '',
    )}&page=rss`;
    const rss = await this.rss.getRssFeed(url);
    const totalPage = Math.floor((rss.channel?.item?.length ?? 0) / PER_PAGE);
    const pageN = isNaN(Number(page))
      ? 1
      : Number(page) > totalPage
      ? totalPage
      : Number(page);
    const res =
      rss.channel && rss.channel?.item?.length > 0
        ? `Results for ${he.decode(String(rss.channel?.title))} (total: ${
            rss.channel.item.length
          }, page ${pageN}/${totalPage})\n ${rss.channel?.item
            .slice(pageN, pageN + PER_PAGE)
            .map(
              (e) =>
                `${he.decode(String(e.title))} (${he.decode(
                  String(e['nyaa:seeders']),
                )}/${he.decode(String(e['nyaa:leechers']))}/${he.decode(
                  String(e['nyaa:downloads']),
                )}) - ${he.decode(String(e.link))}`,
            )
            .join('\n')}
    `
        : 'Data not found';
    return {
      files: [],
      message: res,
    };
  }
}
