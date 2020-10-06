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
import { createWriteStream, existsSync } from 'fs';

const round = (n) => Math.round(n * 100) / 100;
@Controller('clipper')
export class ClipperController implements OnApplicationShutdown {
  private streams: Writable[] = [];
  private preloadMap = new Map<string, number>();

  constructor(private logger: AppLogger) {
    this.logger.setContext('ClipperController');
    rimraf.sync(path.join(__dirname, '../../../files/tmp'));
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
      const info = await ytdl.getInfo(vid, {
        quality: 'highest',
      });
      return {
        data: info.formats[0],
        bestVideo: info.formats.find((t) => t.itag === 18),
      };
    } catch (error) {
      return new HttpException('Oops', 400);
    }
  }
  @Get('preload')
  public async preload(
    @Query('url') url: string,
    @Query('type') type: string,
    @Query('max') maxStr = 'false',
    @Res() res: Response,
  ) {
    try {
      const vid = url;
      const max = maxStr === 'true';
      const options = max
        ? { quality: 'highestvideo' }
        : {
            quality: !type || type === 'gif' ? 18 : 'highest',
          };
      const info = await ytdl.getInfo(vid, {
        ...options,
        highWaterMark: 1024 * 256,
      });
      const vidStream = ytdl(vid, options);
      const tmpname = `tmp/preload-${info.videoDetails.title}${
        max ? '-max' : ''
      }.mp4`;

      if (this.preloadMap.get(tmpname) >= 100) {
        res.send({
          message: 'Downloaded',
          progress: 100,
        });
        return;
      }
      if (this.preloadMap.get(tmpname) < 0) {
        res.send({
          message: 'Failed',
          progress: -1,
        });
        return;
      }
      if (this.preloadMap.get(tmpname) < 100) {
        res.send({
          message: 'Downloading',
          progress: this.preloadMap.get(tmpname),
        });
        return;
      }
      vidStream.on('progress', (_, downloaded, total) => {
        const percent = Math.round((downloaded * 100) / total);
        this.preloadMap.set(tmpname, percent);
        // this.logger.verbose('[preload] downloading ' + tmpname + ' ' + percent);
      });
      await mkdirp(path.join(__dirname, '../../../files/tmp'));
      const resStream = vidStream
        .pipe(
          createWriteStream(path.join(__dirname, '../../../files', tmpname), {
            highWaterMark: 1024 * 64,
          }),
        )
        .on('error', (e) => {
          this.preloadMap.set(tmpname, -1);
          this.logger.verbose('[preload] something went wrong ' + e);
        })
        .on('end', () => {
          this.preloadMap.set(tmpname, 1);
          this.logger.verbose('[preload] downloaded ' + tmpname);
        });
      this.streams.push(resStream);

      this.preloadMap.set(tmpname, 0);
      this.logger.verbose('[preload] downloading ' + tmpname);
      res.send({
        message: 'Started',
        progress: 0,
      });
    } catch {}
  }

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
      const info = await ytdl.getInfo(vid, options);
      const vidStream = ytdl(vid, options);
      const preload = `tmp/preload-${info.videoDetails.title}${
        max ? '-max' : ''
      }.mp4`;
      let resStream;
      if (this.preloadMap.get(preload) === 100) {
        this.logger.verbose('[clipper] using preloaded video');
        resStream = ffmpeg(path.join(__dirname, '../../../files', preload));
      } else {
        this.logger.verbose('[clipper] downloaded info');
        console.log(info.formats[0]);
        // vidStream.on('progress', (_, downloaded, total) => {
        //   this.logger.verbose(
        //     `[ytdl] ${Math.round((downloaded * 100) / total)}% of ${total}`,
        //   );
        // });
        resStream = ffmpeg(vidStream);
      }
      resStream = resStream.setDuration(dur);
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
        resStream = resStream.videoFilters(filters);
      }

      if (Number(start ?? 0) > 0)
        resStream = resStream.seekInput(Number(start ?? 0));

      let filename = `${info.videoDetails.title}_${start}_${end}`;

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
          this.logger.verbose(
            `Saving temp file for ${info.videoDetails.title}`,
          );
          const tmpname = `tmp/tmp-${filename}-${scale}-${x}-${y}-${width}-${height}${
            max ? '-max' : ''
          }.mp4`;
          await mkdirp(path.join(__dirname, '../../../files/tmp'));
          if (!existsSync(path.join(__dirname, '../../../files', tmpname)))
            await new Promise((resolve, reject) =>
              resStream
                .saveToFile(path.join(__dirname, '../../../files', tmpname))
                .on('progress', (progress) => {
                  this.logger.verbose(`[download] ${JSON.stringify(progress)}`);
                })
                .on('end', () => {
                  this.logger.verbose(`[download] saved temp file`);
                  resolve();
                })
                .on('error', (err) => {
                  this.logger.debug(`[download] error: ${err.message}`);
                  reject();
                }),
            );

          this.logger.verbose(`Creating GIF for ${info.videoDetails.title}`);
          resStream = ffmpeg(path.join(__dirname, '../../../files', tmpname))
            .format('gif')
            .outputFPS(Number(fps))
            .videoFilter(
              `fps=${fps},split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
            );
          filename += '.gif';
          res.setHeader('content-type', 'image/gif');
          break;
      }

      if (download) {
        res.setHeader(
          'content-disposition',
          `attachment; filename=${encodeURIComponent(filename)}`,
        );
      } else {
        res.setHeader(
          'content-disposition',
          `inline; filename=${encodeURIComponent(filename)}`,
        );
      }

      // console.log(filename);
      this.streams.push(
        resStream
          .on('progress', (progress) => {
            this.logger.verbose(`[conversion] ${JSON.stringify(progress)}`);
          })
          .on('error', (err) => {
            this.logger.debug(`[conversion] error: ${err.message}`);
            vidStream.destroy();
            resStream.removeAllListeners();
          })
          .on('end', () => {
            this.logger.verbose('[conversion] finished');
          })
          .pipe(res),
      );
    } catch (error) {
      return new HttpException('Oops', 400);
    }
  }

  onApplicationShutdown() {
    this.streams.forEach((s) => {
      s.destroy();
    });
    this.logger.debug('Cleared ' + this.streams.length + ' streams.');
    this.streams = [];
  }
}
