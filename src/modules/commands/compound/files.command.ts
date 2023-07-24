import { ModuleRef } from '@nestjs/core';
import { createWriteStream } from 'fs';
import { mkdirp } from 'mkdirp';
import path from 'path';
import { AppConfigService } from 'src/config/app-config.service';
import { TrelloService } from 'src/modules/trello/trello.service';
import { Message } from '../../messages/messages.model';
import {
  BaseCompoundHandler,
  CompoundResponse,
} from '../compound.handler.base';

export class FileCommand extends BaseCompoundHandler {
  public static startCommand = /^files?(?: (list|get|add)(?: (\d+))?)?/;
  public static requiresAuth = true;
  public command = /(.*?)/;
  public endCommand = /^(end)/;

  private trello: TrelloService;
  private config: AppConfigService;

  private _files: { name: string; url: string }[];
  constructor(moduleRef: ModuleRef) {
    super(moduleRef);
    this.trello = moduleRef.get(TrelloService, { strict: false });
    this.config = moduleRef.get(AppConfigService, { strict: false });
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
        (b) => b.name === 'HamBot',
      );
      const list = (await this.trello.getLists(board.id)).find(
        (l) => l.name === 'files',
      );
      const cards = await this.trello.getCards(list.id);
      this._files = cards.map((c) => ({
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
    if (msg.files) {
      return {
        isCompounding: true,
        message: {
          ...msg,
          files: [],
          message: "File added, type 'end' to stop",
        },
      };
    } else {
      return {
        isCompounding: true,
        message: {
          ...msg,
          files: [],
          message: "Not a valid file, please try again or type 'end' to stop",
        },
      };
    }
  }

  async handleCompound(messages: Message[]): Promise<CompoundResponse> {
    // Do nothing
    const { senderId, channel } = messages[0];
    const tmpPath = path.join(__dirname, '../../../../files/file/tmp');
    await mkdirp(tmpPath);
    const files = await Promise.all(
      messages
        .slice(1)
        .filter((e) => e.files)
        .flatMap((e) => [...e.files, ...(e.image ?? [])])
        .map(async (f) => {
          if ('stream' in f) {
            const url = path.join(tmpPath, f.name);
            await new Promise((resolve, reject) => {
              f.stream
                .pipe(createWriteStream(url))
                .on('finish', resolve)
                .on('error', reject);
            });
            return {
              name: f.name,
              url: this.config.PUBLIC_URL + 'files/' + f.name,
            };
          } else {
            return f;
          }
        }),
    );
    const msg = files.map((e, i) => `${i + 1} - ${e.name}`).join('\n');
    const board = (await this.trello.getBoards()).find(
      (b) => b.name === 'HamBot',
    );
    const list = (await this.trello.getLists(board.id)).find(
      (l) => l.name === 'files',
    );
    await Promise.all(
      files.map((f) => this.trello.addCard(list.id, f.name, f.url)),
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
