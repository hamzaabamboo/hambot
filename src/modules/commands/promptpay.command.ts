import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import * as generatePayload from 'promptpay-qr';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PromptPayCommand extends BaseCommand {
  public command = /^(?:pp|promptpay)(?: (\d{9,10})(?: (\d+))?)?/;

  constructor(private config: ConfigService) {
    super();
  }

  async handle(
    message: Message,
    id: string,
    amountS?: string,
  ): Promise<Message> {
    const amount = parseInt(amountS ?? '0');
    if (id && !isNaN(amount)) {
      return {
        ...message,
        files: [],
        message: `QRCode for ${id} ` + (amountS ? amountS + ' THB' : ''),
        image: {
          url:
            this.config.get('PUBLIC_URL') +
            'qrcode/' +
            generatePayload(id, { amount: amount }),
          name: 'qrcode.png',
        },
      };
    }
    return {
      ...message,
      files: [],
      message: 'Usage: <pp|promptpay> <id> <amount>',
    };
  }
}
