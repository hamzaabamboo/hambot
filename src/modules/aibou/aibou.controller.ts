import { Body, Controller, Header, Post, Req, Res } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AibouService } from './aibou.service';

@Controller('aibou')
export class AibouController {
  constructor(private service: AibouService) {}
  @Post('/sync')
  async syncData(
    @Body() data: any,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    if (req.headers['x-aibou-secret'] !== 'niggalovechicken') {
      res.status(400).send('bye');
    }
    const { newData, lastUpdatedAt } = data;

    const dataToReturn = await this.service.fetchNewData(lastUpdatedAt);

    await this.service.saveNewData(newData);

    res.status(200).send(dataToReturn);
  }
}
