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
import ffmpeg from 'fluent-ffmpeg';
import { Response } from 'express';

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
    if (!url) throw new HttpException('Url is not supplied', 400);
    const vid = url;
    try {
      const info = await ytdl.getInfo(vid);
      return info.formats[0];
    } catch (error) {
      return new HttpException('Oops', 400);
    }
  }

  @Get('clip')
  public async clipStream(
    @Query('url') url: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('download') download: string,
    @Query('type') type: string,
    @Res() res: Response,
  ) {
    if (!url) throw new HttpException('Url is not supplied', 400);
    const vid = url;

    if (isNaN(Number(end)) || isNaN(Number(start))) {
      return new HttpException('Invalid start/end time', 400);
    }
    try {
      const info = await ytdl.getInfo(vid);
      const vidStream = ytdl(vid);
      let resStream = ffmpeg(vidStream)
        .seekInput(Number(start ?? 0))
        .setDuration(Number(end) - Number(start));

      console.log(vid, Number(start ?? 0), end, Number(end) - Number(start));

      let filename = encodeURIComponent(info.videoDetails.title);

      switch (type) {
        case 'flv':
          resStream = resStream.format('flv');
          res.setHeader('content-type', 'video/flv');
          filename += '.flv';
          break;
        case 'mov':
          resStream = resStream.format('mov');
          res.setHeader('content-type', 'video/mov');
          filename += '.mov';
          break;
        case 'webp':
          resStream = resStream.format('webp');
          res.setHeader('content-type', 'video/webp');
          filename += '.webp';
          break;
        default:
          resStream = resStream
            .format('gif')
            .outputFPS(15)
            .size('50%');
          filename += '.gif';
          res.setHeader('content-type', 'image/gif');
          break;
      }

      if (download) {
        res.setHeader(
          'content-disposition',
          `attachment; filename=${filename}`,
        );
      } else {
        res.setHeader('content-disposition', `inline; filename=${filename}`);
      }
      resStream
        .on('error', e => {
          console.log('Something wrong', e);
          vidStream.destroy();
          resStream.removeAllListeners();
        })
        .pipe(res);
    } catch (error) {
      return new HttpException('Oops', 400);
    }
  }
}
