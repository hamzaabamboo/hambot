import {
  Controller,
  Get,
  Render,
  Res,
  HttpException,
  Param,
  Query,
  OnApplicationShutdown,
} from '@nestjs/common';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { Response } from 'express';
import { Readable, Stream, Writable } from 'stream';
import { AppLogger } from '../logger/logger';

@Controller('clipper')
export class ClipperController implements OnApplicationShutdown {
  private streams: Writable[] = [];

  constructor(private logger: AppLogger) {
    this.logger.setContext('ClipperController');
  }

  @Get()
  @Render('clipper/index') // this will render `views/index.tsx`
  public showHome() {
    const user = { name: 'World' };
    return { user };
  }

  @Get('vid')
  public async getStream(@Query('url') url: string) {
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

    const dur = Number(end) - Number(start);
    if (isNaN(Number(end)) || isNaN(Number(start))) {
      return new HttpException('Invalid start/end time', 400);
    }

    if (dur > 600) {
      return new HttpException('Video clip too long', 400);
    }
    try {
      const info = await ytdl.getInfo(vid);
      const vidStream = ytdl(vid, {
        quality: 'highest',
      });
      let resStream = ffmpeg(vidStream);
      if (Number(start ?? 0) > 0)
        resStream = resStream.seekInput(Number(start ?? 0));

      // console.log(vid, Number(start ?? 0), end, dur);

      let filename = encodeURIComponent(
        `${info.videoDetails.title}_${start}_${end}`,
      );

      switch (type) {
        case 'mp4':
          resStream = resStream
            .format('mp4')
            .outputOptions('-movflags frag_keyframe+empty_moov');
          res.setHeader('content-type', 'video/mp4');
          filename += '.mp4';
          break;
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
        case 'mp3':
          resStream = resStream.format('mp3');
          res.setHeader('content-type', 'audio/mp3');
          filename += '.mp3';
          break;
        case 'wav':
          resStream = resStream.format('wav');
          res.setHeader('content-type', 'audio/wav');
          filename += '.wav';
          break;
        default:
          resStream = resStream
            .format('gif')
            .outputFPS(12)
            // .videoFilters('split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse')
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

      resStream = resStream.setDuration(dur);
      // console.log(filename);
      this.streams.push(
        resStream
          .on('error', e => {
            console.log('Something wrong', e);
            vidStream.destroy();
            resStream.removeAllListeners();
          })
          .pipe(res),
      );
    } catch (error) {
      return new HttpException('Oops', 400);
    }
  }

  onApplicationShutdown() {
    this.streams.forEach(s => {
      s.destroy();
    });
    this.logger.debug('Cleared ' + this.streams.length + ' streams.');
    this.streams = [];
  }
}
