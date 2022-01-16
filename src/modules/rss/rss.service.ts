import {  HttpService } from '@nestjs/axios';
import {  Injectable } from '@nestjs/common';
import {  XMLParser } from 'fast-xml-parser';
import {  firstValueFrom } from 'rxjs';

@Injectable()
export class RssService {
  constructor(private http: HttpService) { }

  async getRssFeed(url: string): Promise<Partial<RSS>> {
    try {
      const { data } = await firstValueFrom(this.http.get(url));
      const parser = new XMLParser();
      const json = parser.parse(data);
      const res = json?.rss as RSS;
      return res;
    } catch (error) {
      return {};
    }
  }
}

interface RSS {
  channel: {
    title: string;
    link: string;
    description: string;
    language?: string;
    copyright?: string;
    managingEditor?: string;
    webMaster?: string;
    pubDate?: string;
    lastBuildDate?: string;
    category?: string;
    generator?: string;
    docs?: string;
    cloud?: string;
    ttl?: number;
    image?: {
      url: string;
      title: string;
      link: string;
      width?: number;
      height?: number;
      description?: number;
    };
    textInput?: {
      title: string;
      description: string;
      name: string;
      link: string;
    };
    skipHours?: string;
    skipDays?: string;
    item: {
      title?: string;
      description?: string;
      link?: string;
      author?: string;
      category?: string;
      comment?: string;
      enclosure?: string;
      guid?: string;
      pubDate?: string;
      source?: string;
      [key: string]: string;
    }[];
  };
}
