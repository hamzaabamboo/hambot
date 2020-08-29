import {
  Controller,
  Get,
  Render,
  Res,
  HttpException,
  Param,
  Query,
} from '@nestjs/common';
import ytdl from 'ytdl-core';

@Controller('clipper')
export class ClipperController {
  @Get()
  @Render('clipper/index') // this will render `views/index.tsx`
  public showHome() {
    const user = { name: 'World' };
    return { user };
  }

  @Get('vid')
  public async getStreaam(@Query('url') url: string) {
    const vid = url || 'https://www.youtube.com/watch?v=-e_v9iWHF3c';
    try {
      const info = await ytdl.getInfo(vid);
      return info.formats[0];
    } catch (error) {
      return new HttpException('Oops', 400);
    }
  }
}
