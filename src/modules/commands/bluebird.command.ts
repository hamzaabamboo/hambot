import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AppConfigService } from '../../config/app-config.service';
import { Message } from '../messages/messages.model';
import { BaseCommand } from './command.base';
import { isAxiosError } from 'axios';

@Injectable()
export class BluebirdCommand extends BaseCommand {
  public name = 'bluebird';
  public command = /^(?:bluebird|bb)(?: (.*))?$/i;
  public requiresAuth = true;

  constructor(
    private httpService: HttpService,
    private configService: AppConfigService,
  ) {
    super();
  }

  async handle(message: Message, text: string) {
    const url = 'https://with-meets.ham-san.net/api/bluebird/chat/';
    const secret = this.configService.BLUEBIRD_SECRET;
    const payload = {
      messages: [
        {
          parts: [{ type: 'text', text }],
          role: 'user',
        },
      ],
    };
    const headers = {
      'x-bluebird-secret': secret,
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, payload, { headers }),
      );

      return {
        ...message,
        message: response.data as string,
      };
    } catch (e) {
      if (isAxiosError(e)) {
        return {
          ...message,
          message: `${e.message}` as string,
        };
      }
      return {
        ...message,
        message: `Something went wrong ${e}` as string,
      };
    }
  }
}
