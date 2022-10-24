import { Controller } from '@nestjs/common';
import { AppConfigService } from 'src/config/app-config.service';

@Controller('twitter')
export class TwitterController {
  constructor(private config: AppConfigService) { }

  // @Get('/')
  // challengeCRC(@Query('crc_token') token: string) {
  //   if (!token) throw new HttpException('token not supplied', 400);
  //   const hmac = crypto.createHmac(
  //     'sha256',
  //     this.config.TWITTER_API_SECRET,
  //   );
  //   hmac.update(token);
  //   const digest = hmac.digest('hex');
  //   return {
  //     response_token: 'sha256=' + digest,
  //   };
  // }
}
