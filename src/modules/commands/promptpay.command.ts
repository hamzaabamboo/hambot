import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import generatePayload from 'promptpay-qr';
import { AppConfigService } from 'src/config/app-config.service';

@Injectable()
export class PromptPayCommand extends BaseCommand {
  public name = 'promptpay';
  public command = /^(?:pp|promptpay)(?: (\d{9,10})(?: (\d+))?)?/;

  constructor(private config: AppConfigService) {
    super();
  }

  async handle(message: Message, id: string, amountS?: string) {
    const amount = parseInt(amountS ?? '0');
    if (id && !isNaN(amount)) {
      return {
        files: [],
        message: `QRCode for ${id} ` + (amountS ? amountS + ' THB' : ''),
        image: [
          {
            url:
              this.config.PUBLIC_URL +
              'qrcode/' +
              generatePayload(id, { amount: amount }),
            name: 'qrcode.png',
          },
        ],
      };
    }
    return {
      files: [],
      message: 'Usage: <pp|promptpay> <id> <amount>',
    };
  }
}
