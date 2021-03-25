import { Controller, Get, Header, HttpService, Query } from '@nestjs/common';

@Controller('/d4dj')
export class D4DJController {
  constructor(private http: HttpService) {}

  @Get('/sig')
  @Header('Access-Control-Allow-Origin', 'https://hamzaabamboo.github.io')
  @Header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  @Header('Access-Control-Allow-Headers', 'Content-Type')
  async getHello(@Query('url') url: string) {
    if (!url || !url.match('projectdivar')) return ':P';
    const res = await this.http.get(url).toPromise();
    return res.data;
  }
}
