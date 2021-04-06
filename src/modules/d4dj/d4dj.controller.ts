import {
  Body,
  Controller,
  Get,
  Header,
  HttpService,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { request } from 'gaxios';
import { Readable } from 'stream';

@Controller('/d4dj')
export class D4DJController {
  constructor(private http: HttpService) {}

  @Get('/sig')
  @Post('/sig')
  @Header('Access-Control-Allow-Origin', 'https://hamzaabamboo.github.io')
  @Header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  @Header('Access-Control-Allow-Headers', 'Content-Type')
  async proxySig(
    @Query('url') url: string,
    @Res() res: Response<any, any>,
    @Req() req: Request<any>,
  ) {
    if (!url || !url.match('projectdivar')) return ':P';
    const a = await request<Readable>({
      url: url as string,
      method: req.method ?? ('GET' as any),
      data: req.body,
      headers: {
        'Cache-Control': 'no-cache',
      },
      responseType: 'stream',
    });
    res.send(a.data);
  }

  @Get('/d4db')
  @Post('/d4db')
  @Header('Access-Control-Allow-Origin', 'https://hamzaabamboo.github.io')
  @Header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  @Header('Access-Control-Allow-Headers', 'Content-Type')
  async getD4DB(
    @Query('url') url: string,
    @Res() res: Response<any, any>,
    @Req() req: Request<any>,
  ) {
    if (!url || !url.match('d4-dj')) return ':P';
    const a = await request<Readable>({
      url: req.query.url as string,
      method: req.method ?? ('GET' as any),
      data: req.body,
      headers: {
        'Cache-Control': 'no-cache',
      },
      responseType: 'stream',
    });
    res.send(a.data);
  }
}
