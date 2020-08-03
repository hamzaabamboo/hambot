import { Controller, Get, Query, HttpException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Controller('twitter')
export class TwitterController {
  constructor(private config: ConfigService) {}

  @Get('/')
  challengeCRC(@Query('crc_token') token: string) {
    if (!token) throw new HttpException('token not supplied', 400);
    const hmac = crypto.createHmac(
      'sha256',
      this.config.get('TWITTER_API_SECRET'),
    );
    hmac.update(token);
    const digest = hmac.digest('hex');
    return {
      // eslint-disable-next-line @typescript-eslint/camelcase
      response_token: 'sha256=' + digest,
    };
  }

  // @Post('/')
  // webhook() {}
}
