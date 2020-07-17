import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import * as generatePayload from 'promptpay-qr';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PromptpayCommand extends BaseCommand {
  public command = /(?:pp|promptpay)(?: (\d{9,10})(?: (\d+))?)?/;

  constructor(private config: ConfigService) {
    super();
  }

  async handle(message: Message, id: string, amountS: string) {
    const amount = parseInt(amountS);
    if (id && !isNaN(amount)) {
      return {
        ...message,
        message: `QRCode for ${id} ${amountS} THB`,
        imageURL:
          this.config.get('PUBLIC_URL') +
          'qrcode/' +
          generatePayload(id, { amount: amount }),
      };
    }
    return {
      ...message,
      message: 'Usage: <pp|promptpay> <id> <amount>',
    };
  }
}
