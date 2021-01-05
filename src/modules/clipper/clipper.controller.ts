import {
  Controller,
  Get,
  Res,
  HttpException,
  Query,
  OnApplicationShutdown,
  Render,
} from '@nestjs/common';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { Response } from 'express';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import path from 'path';
import { Writable } from 'stream';
import { AppLogger } from '../logger/logger';
import { createWriteStream, existsSync, fstat } from 'fs';
import { fetchFile } from '@ffmpeg/ffmpeg';
import { ClipperService } from './clipper.service';

const round = (n) => Math.round(n * 100) / 100;
@Controller('clipper')
export class ClipperController implements OnApplicationShutdown {
  private streams: Writable[] = [];

  constructor(private logger: AppLogger, private clipper: ClipperService) {
    this.logger.setContext('ClipperController');
    rimraf.sync(path.join(__dirname, '../../../files/tmp'));
  }

  @Get('vid')
  public async getStream(@Query('url') url: string) {
    if (!url) throw new HttpException('Url is not supplied', 400);
    const vid = url;
    try {
      const info = await ytdl.getInfo(vid, {
        requestOptions: {
          quality: 'highest',
        },
      });
      const formats = info.formats.filter(
        (f) => !f.isHLS && !f.isDashMPD && !f.isLive,
      );
      return {
        data: formats[0],
        bestVideo: formats.find((t) => t.itag === 18),
      };
    } catch (error) {
      this.logger.error(error);
      return new HttpException(error, 400);
    }
  }

  //TODO: Remove This Part + Refactor
  @Get('clip')
  public async clipStream(
    @Query('url') url: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('download') download: string,
    @Query('type') type: string,
    @Query('fps') fps = 30,
    @Query('scale') scale = 1,
    @Query('x') x = 0,
    @Query('y') y = 0,
    @Query('width') width = 1,
    @Query('height') height = 1,
    @Query('max') maxStr = 'false',
    @Res() res: Response,
  ) {
    if (!url) throw new HttpException('Url is not supplied', 400);
    const vid = url;
    const max = maxStr === 'true';

    const dur = Number(end) - Number(start);
    if (isNaN(Number(end)) || isNaN(Number(start))) {
      return new HttpException('Invalid start/end time', 400);
    }

    if (dur > 600) {
      return new HttpException('Video clip too long', 400);
    }
    try {
      this.logger.verbose('[clipper] downloading info');
      const options =
        type === 'mp3'
          ? { quality: '140' }
          : max
          ? { quality: 'highestvideo' }
          : {
              quality: !type || type === 'gif' ? 18 : 'highest',
            };
      const info = await ytdl.getInfo(vid, {
        requestOptions: {
          options,
        },
      });

      let filename = `${encodeURIComponent(
        info.videoDetails.title,
      )}_${start}_${end}`;

      const tmpname = `tmp/tmp-${filename}.mp4`;

      if (this.clipper.ffmpeg.FS('stat', tmpname)) {
        this.logger.verbose('[clipper] using preloaded video');
        this.clipper.ffmpeg.FS('readFile', tmpname);
      } else {
        this.logger.verbose('[clipper] downloaded info');
        // console.log(info.formats[0]);
        // vidStream.on('progress', (_, downloaded, total) => {
        //   this.logger.verbose(
        //     `[ytdl] ${Math.round((downloaded * 100) / total)}% of ${total}`,
        //   );
        // });
        this.clipper.ffmpeg.FS(
          'writeFile',
          `${tmpname}`,
          await fetchFile(
            info.formats
              .filter((f) => !f.isHLS && !f.isDashMPD && !f.isLive)
              .find((t) => t.itag === 18).url,
          ),
        );
      }

      const args = ['-i', `${tmpname}`];

      if (Number(start ?? 0) > 0)
        args.push('-ss', Number(start ?? 0).toString());

      args.push('-t', dur.toString());

      if (type !== 'mp3') {
        const filters = [];
        if (
          Number(x) >= 0 &&
          Number(y) >= 0 &&
          Number(width) > 0 &&
          Number(height) > 0
        ) {
          filters.push(
            `crop=${round(width)}*in_w:${round(height)}*in_h:${round(
              x,
            )}*in_w:${round(y)}*in_h`,
          );
        }

        filters.push(`scale=${scale}*in_w:-2`);
        args.push('-vf', filters.join(','));
      }

      switch (type) {
        case 'mp4':
          res.type('mp4');
          filename += '.mp4';
          args.push('-movflags', 'frag_keyframe+empty_moov');
          break;
        case 'flv':
          res.type('flv');
          filename += '.flv';
          break;
        case 'mov':
          res.type('mov');
          filename += '.mov';
          break;
        case 'webp':
          res.type('webp');
          filename += '.webp';
          break;
        case 'mp3':
          res.type('mp3');
          filename += '.mp3';
          break;
        case 'wav':
          res.type('wav');
          filename += '.wav';
          break;
        default:
          this.logger.verbose(
            `Saving temp file for ${info.videoDetails.title}`,
          );
          args.push(`tmp-${filename}.mp4`);
          await this.clipper.ffmpeg.run(...args);

          this.logger.verbose(`Creating GIF for ${info.videoDetails.title}`);
          args.splice(0, args.length);
          args.push(
            '-i',
            `tmp-${filename}.mp4`,
            '-vf',
            `fps=${fps},split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
          );
          res.type('gif');
          filename += '.gif';
          break;
      }

      if (download) {
        res.header('content-disposition', `attachment; filename=${filename}`);
      } else {
        res.header('content-disposition', `inline; filename=${filename}`);
      }

      args.push(`${filename}`);

      await this.clipper.ffmpeg.run(...args);
      const file = this.clipper.ffmpeg.FS('readFile', filename) as Uint8Array;

      res.send(Buffer.from(file));
    } catch (error) {
      return new HttpException('Oops', 400);
    }
  }

  onApplicationShutdown() {
    // this.streams.forEach((s) => {
    //   s.destroy();
    // });
    // this.logger.debug('Cleared ' + this.streams.length + ' streams.');
    // this.streams = [];
  }
}
