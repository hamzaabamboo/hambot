import {
  Controller,
  Get,
  Header,
  HttpService,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

@Controller('/d4dj')
export class D4DJController {
  constructor(private http: HttpService) {}

  @Get('/sig')
  @Header('Access-Control-Allow-Origin', 'https://hamzaabamboo.github.io')
  @Header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  @Header('Access-Control-Allow-Headers', 'Content-Type')
  async proxySig(@Query('url') url: string) {
    if (!url || !url.match('projectdivar')) return ':P';
    const res = await this.http.get(url).toPromise();
    return res.data;
  }

  @Get('/d4db')
  @Header('Access-Control-Allow-Origin', 'https://hamzaabamboo.github.io')
  @Header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  @Header('Access-Control-Allow-Headers', 'Content-Type')
  async proxyD4DB(@Query('url') url: string, @Req() req: Request) {
    if (!url || !url.match('d4-dj')) return ':P';
    const res = await this.http
      .request({ url, method: req.method as any })
      .toPromise();
    return res.data;
  }
}
