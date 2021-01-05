import { Injectable } from '@nestjs/common';
import { createFFmpeg } from '@ffmpeg/ffmpeg';
import { AppLogger } from '../logger/logger';

@Injectable()
export class ClipperService {
  loaded = false;
  ffmpeg = createFFmpeg({
    corePath: '../../../core/dist/ffmpeg-core.js',
    log: false,
  });
  constructor(private logger: AppLogger) {
    this.logger.setContext('FFmpeg');
    this.ffmpeg.setLogger(({ type, message }) => {
      if (type === 'fferr') {
        this.logger.error(`${message}`);
      } else {
        this.logger.debug(`${message}`);
      }
    });
    this.ffmpeg
      .load()
      .then(() => {
        this.loaded = true;
      })
      .catch(() => {
        this.logger.error('Something went wrong');
      });
  }
}
