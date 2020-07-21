import {
  Message,
  FileWithStream,
  FileWithUrl,
} from '../../messages/messages.model';
import {
  BaseCompoundHandler,
  CompoundResponse,
} from '../compound.handler.base';
import { TrelloService } from 'src/modules/trello/trello.service';
import { ModuleRef } from '@nestjs/core';
import * as mkdirp from 'mkdirp';
import { createWriteStream } from 'fs';
import { ConfigService } from '@nestjs/config';
import path = require('path');

export class FileCommand extends BaseCompoundHandler {
  public static startCommand = /^files?(?: (list|get|add)(?: (\d+))?)?/;
  public static requiresAuth = true;
  public command = /(.*?)/;
  public endCommand = /^(end)/;

  private trello: TrelloService;
  private config: ConfigService;

  private _files: { name: string; url: string }[];
  constructor(moduleRef: ModuleRef) {
    super(moduleRef);
    this.trello = moduleRef.get(TrelloService, { strict: false });
    this.config = moduleRef.get(ConfigService, { strict: false });
  }
  matchStart(input: string): boolean {
    return this.command.test(input);
  }

  async handleInput(message: Message): Promise<CompoundResponse> {
    if (this.endCommand.test(message.message)) {
      return this.handleCompound(this.messages);
    }
    if (this.messages.length === 0) {
      const params = FileCommand.startCommand.exec(message.message).slice(1);
      return this.handleStart(message, params[0], params[1]);
    }
    if (this.command.test(message.message)) {
      return this.handleMessages(message);
    }
  }

  async getFiles() {
    if (!this._files) {
      const board = (await this.trello.getBoards()).find(
        b => b.name === 'HamBot',
      );
      const list = (await this.trello.getLists(board.id)).find(
        l => l.name === 'files',
      );
      const cards = await this.trello.getCards(list.id);
      this._files = cards.map(c => ({
        name: c.name,
        url: c.desc,
      }));
    }
    return this._files;
  }
  async handleStart(
    msg: Message,
    command: string,
    index: string,
  ): Promise<CompoundResponse> {
    const card = await this.getFiles();
    switch (command) {
      case 'list':
        return {
          isCompounding: false,
          message: {
            ...msg,
            files: [],
            message:
              'Available Files:\n' +
              card.map((c, i) => `${i + 1} - ${c.name}`).join('\n'),
          },
        };
      case 'get':
        const pos = Number(index);
        const files = await this.getFiles();
        if (pos > files.length || pos < 1)
          return {
            isCompounding: false,
            message: {
              ...msg,
              files: [],
              message: 'Invalid file index, check with files get',
            },
          };
        return {
          isCompounding: false,
          message: {
            ...msg,
            message: 'File: ' + files[pos - 1].name,
            files: [files[pos - 1]],
          },
        };
      case 'add':
        this.messages.push(msg);
        return {
          isCompounding: true,
          message: {
            ...msg,
            files: [],
            message: "Waiting for file, type 'end' to stop",
          },
        };
      default:
        return {
          isCompounding: false,
          message: {
            ...msg,
            files: [],
            message: 'Usage: file(s) <get/add/list> <index>',
          },
        };
    }
  }

  handleMessages(msg: Message): CompoundResponse {
    this.messages.push(msg);
    return {
      isCompounding: true,
      message: {
        ...msg,
        files: [],
        message: "File added, type 'end' to stop",
      },
    };
  }

  async handleCompound(messages: Message[]): Promise<CompoundResponse> {
    // Do nothing
    const { senderId, channel } = messages[0];
    const tmpPath = path.join(__dirname, 'tmp');
    await mkdirp(tmpPath);
    const files = await Promise.all(
      messages
        .slice(1)
        .flatMap(e => e.files)
        .map(async f => {
          if ((f as FileWithStream).stream) {
            const url = path.join(tmpPath, f.name);
            await new Promise((resolve, reject) => {
              (f as FileWithStream).stream
                .pipe(createWriteStream(url))
                .on('finish', resolve)
                .on('error', reject);
            });
            return {
              name: f.name,
              url: this.config.get('PUBLIC_URL') + 'files/' + f.name,
            };
          } else {
            return f as FileWithUrl;
          }
        }),
    );
    const msg = files.map((e, i) => `${i + 1} - ${e.name}`).join('\n');
    const board = (await this.trello.getBoards()).find(
      b => b.name === 'HamBot',
    );
    const list = (await this.trello.getLists(board.id)).find(
      l => l.name === 'files',
    );
    console.log(files);
    await Promise.all(
      files.map(f => this.trello.addCard(list.id, f.name, f.url)),
    );
    return {
      isCompounding: false,
      message: {
        senderId,
        channel,
        message: msg === '' ? 'No file received' : 'Added\n' + msg,
      },
    };
  }
}
