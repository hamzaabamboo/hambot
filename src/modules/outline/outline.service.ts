import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Link, Root, Table, Text } from 'mdast';
import { join } from 'path';
import { AppConfigService } from 'src/config/app-config.service';
import { dynamicImport } from 'src/utils';
import { AppLogger } from '../logger/logger';
import { Paths } from './outline';

type SettingDocumentKey = 'todo' | 'recurring' | 'done';
type OutlineSettings = Record<SettingDocumentKey, string>;
@Injectable()
export class OutlineService {
  private client: AxiosInstance;
  private settings: OutlineSettings;
  constructor(
    private logger: AppLogger,
    configService: AppConfigService,
  ) {
    this.logger.setContext('OutlineService');
    if (!configService.OUTLINE_URL || !configService.OUTLINE_API_TOKEN) return;
    this.logger.verbose('Initializing Outline');
    this.client = axios.create({
      baseURL: join(configService.OUTLINE_URL, 'api'),
      headers: {
        Authorization: `Bearer ${configService.OUTLINE_API_TOKEN}`,
      },
    });
    this.getSettings(configService.OUTLINE_SETTINGS_DOCUMENT_ID);
  }

  async getDocuments() {
    const result = (await this.client.post(
      'documents.list',
    )) as Paths.DocumentsList.Post.Responses.$200;
    return result.data;
  }

  async getDocumentById(id: string) {
    const result = await this.client.post('documents.info', {
      id,
    } satisfies Paths.DocumentsInfo.Post.RequestBody);
    return result.data as Paths.DocumentsInfo.Post.Responses.$200;
  }

  async getSettings(settingsPageId: string) {
    this.logger.verbose('Loading Outline Settings');
    const res = await this.getDocumentById(settingsPageId);

    const tree: Root = await OutlineService.parseMarkdown(res.data.text);

    this.settings = Object.fromEntries(
      tree.children
        .find((c): c is Table => c.type === 'table')
        .children.slice(1)
        .map((c) => [
          (c.children[0].children[0] as Text)?.value,
          (c.children[1].children[0] as Link)?.url ??
            (c.children[1].children[0] as Text)?.value,
        ]),
    ) as OutlineSettings;

    this.logger.verbose('Outline Settings Completed');
    return this.settings;
  }

  async getSettingDocument(settingKey: SettingDocumentKey) {
    if (!this.settings?.[settingKey]) return undefined;
    return await this.getDocumentById(
      this.settings?.[settingKey].replace('/doc/', ''),
    );
  }

  static async parseMarkdown(text: string) {
    const { fromMarkdown } = await dynamicImport('mdast-util-from-markdown');
    const { gfmFromMarkdown } = await dynamicImport('mdast-util-gfm');
    const { gfm } = await dynamicImport('micromark-extension-gfm');

    const tree: Root = fromMarkdown(text, {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown()],
    });

    return tree;
  }
}
