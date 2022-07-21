import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { request } from 'gaxios';
import { PassThrough, Readable } from 'stream';
import axios from 'axios';

@Controller('/d4dj')
export class D4DJController {
  constructor(private http: HttpService) {}

  @Get('/sig')
  @Post('/sig')
  @Header('Access-Control-Allow-Origin', 'https://hamzaabamboo.github.io')
  @Header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  @Header('Access-Control-Allow-Headers', 'Content-Type')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async proxySig(@Query('url') url: string, @Req() req: Request<any>) {
    if (!url || !url.match('projectdivar')) return ':P';
    const a = await axios({
      url: req.query.url as string,
      method: req.method ?? ('GET' as any),
      data: req.body,
      headers: {
        'Cache-Control': 'no-cache',
      },
      responseType: 'stream',
    });
    return a.data;
  }

  @Get('/d4db')
  @Post('/d4db')
  @Header('Access-Control-Allow-Origin', 'https://hamzaabamboo.github.io')
  @Header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  @Header('Access-Control-Allow-Headers', 'Content-Type')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async getD4DB(@Query('url') url: string, @Req() req: Request<any>) {
    if (!url || !url.match('d4-dj')) return ':P';
    const a = await axios({
      url: req.query.url as string,
      method: req.method ?? ('GET' as any),
      data: req.body,
      headers: {
        'Cache-Control': 'no-cache',
      },
      responseType: 'stream',
    });
    return a.data;
  }
}
