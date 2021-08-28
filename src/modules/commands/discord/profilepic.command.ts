import { HttpService } from '@nestjs/axios';
import {
  Message,
  DiscordMessage,
  FileWithUrl,
} from '../../messages/messages.model';
import path from 'path';
import mkdirp from 'mkdirp';
import {
  promises as fs,
  createWriteStream,
  existsSync,
  readFileSync,
} from 'fs';
import {
  BaseCompoundHandler,
  CompoundResponse,
} from '../compound.handler.base';
import { ModuleRef } from '@nestjs/core';
import { TextChannel } from 'discord.js';

export class ProfilePicCommand extends BaseCompoundHandler {
  public static startCommand =
    /^profilepic(?: (list|add|set|remove)(?: (.*))?)?/i;
  public command = /^profilepic(?: (list|add|set|remove)(?: (.*))?)?/i;
  public endCommand = /^(cancel)/;

  public messages: Message[] = [];
  public requiresAuth = true;
  public platforms = ['discord'];

  public path = path.join(__dirname, '../../../../files/profilepic');

  private http: HttpService;

  constructor(moduleRef: ModuleRef) {
    super(moduleRef);
    this.http = moduleRef.get(HttpService, { strict: false });
  }

  async handleInput(message: DiscordMessage): Promise<CompoundResponse> {
    if (this.endCommand.test(message.message)) {
      return {
        isCompounding: false,
        message: {
          ...message,
          message: 'Cancled',
        },
      };
    }
    if (this.messages.length === 0) {
      const params = ProfilePicCommand.startCommand
        .exec(message.message)
        .slice(1);
      this.messages.push(message);
      return this.handleStart(message, params[0], params[1]);
    }
    if (message.files.length > 0) {
      const file = message.files[0] as FileWithUrl;
      const stream = await this.http.get(file.url, { responseType: 'stream' });
      (stream as any).data.pipe(
        createWriteStream(path.join(this.path, file.name)),
      );
      return {
        isCompounding: false,
        message: {
          files: [],
          message: 'Image ' + file.name + ' added!',
        },
      };
    }
  }

  async handleStart(message: DiscordMessage, command: string, pic: string) {
    if (!(message.messageChannel as TextChannel)?.guild) {
      return {
        isCompounding: false,
        message: {
          files: [],
          message: 'Not in a guild',
        },
      };
    }

    await mkdirp(this.path);

    switch (command) {
      case 'list':
        const files = await fs.readdir(this.path);
        return {
          isCompounding: false,
          message: {
            files: [],
            message:
              files.length > 0
                ? 'Available profile pictures: \n' + files.join('\n')
                : 'No profile picture',
          },
        };
      case 'add':
        return {
          isCompounding: true,
          message: {
            files: [],
            message: 'Upload image here',
          },
        };
      case 'remove':
        if (!existsSync(path.join(this.path, pic))) {
          return {
            isCompounding: false,
            message: {
              files: [],
              message: 'Pic not found',
            },
          };
        }
        await fs.unlink(path.join(this.path, pic));
        return {
          isCompounding: false,
          message: {
            files: [],
            message: `Deleted ${pic}`,
          },
        };
      case 'set':
        if (!existsSync(path.join(this.path, pic))) {
          return {
            isCompounding: false,
            message: {
              files: [],
              message: 'Pic not found',
            },
          };
        }
        try {
          await (message.messageChannel as TextChannel)?.guild.setIcon(
            readFileSync(path.join(this.path, pic)),
          );
        } catch (error) {}
        return {
          isCompounding: false,
          message: {
            files: [],
            message: `Server icon changed to ${pic}`,
          },
        };
      default:
        return {
          isCompounding: false,
          message: {
            files: [],
            message: 'Usage: profilepic <list|set>',
          },
        };
    }
  }
}
