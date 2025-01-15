import { Controller, Get, Param, Header, Res, Query } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ABCFortuneService } from './abc-fortune.service';
import { AppConfigService } from 'src/config/app-config.service';

@Controller('abc-fortune')
export class ABCFortuneController {
  constructor(
    private abcFortune: ABCFortuneService,
    private appConfigService: AppConfigService,
  ) {}

  @Get('/')
  async getTodayFortune(
    @Res() reply: FastifyReply,
    @Query('token') token: string,
  ) {
    if (
      !token ||
      (token !== this.abcFortune.getTodayHash() &&
        token !== this.appConfigService.HAMBOT_KEY)
    ) {
      return reply.status(401).send();
    }
    const file = await this.abcFortune.getFortune();
    reply.header(
      'content-disposition',
      `attachment; filename=${this.abcFortune.getFilename()}`,
    );
    reply.send(file);
  }
}
