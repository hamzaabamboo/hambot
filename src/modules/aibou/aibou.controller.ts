import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppConfigService } from 'src/config/app-config.service';
import { AibouService } from './aibou.service';

@Controller('aibou')
export class AibouController {
  constructor(
    private service: AibouService,
    private config: AppConfigService,
  ) {}
  @Post('/sync')
  async syncData(
    @Body() data: any,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    if (req.headers['x-aibou-secret'] !== this.config.AIBOU_SECRET) {
      res.status(401).send('bye');
    }
    const { newData, lastUpdated } = data;

    const dataToReturn = await this.service.fetchNewData(lastUpdated);

    await this.service.saveNewData(newData);

    res.status(200).send(dataToReturn);
  }
}
