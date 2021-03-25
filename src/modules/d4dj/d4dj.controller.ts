import { Controller, Get, HttpService, Query } from '@nestjs/common';

@Controller('/d4dj')
export class D4DJController {
  constructor(private http: HttpService) {}

  @Get('/sig')
  async getHello(@Query('url') url: string) {
    if (!url || !url.match('projectdivar')) return ':P';
    const res = await this.http.get(url).toPromise();
    return res.data;
  }
}
