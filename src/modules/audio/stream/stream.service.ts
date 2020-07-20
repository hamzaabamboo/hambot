import { Controller, Injectable, Scope } from '@nestjs/common';
import { createSimpleServer, createServer } from '@mediafish/rtmp-server';
import { writer } from '@mediafish/buffer-operator';
import { print, writeData, type } from '@mediafish/flv';
import { AppLogger } from 'src/modules/logger/logger';
import { Readable, Writable, Transform } from 'stream';
import { createWriteStream, writeFile, fstat } from 'fs';
import * as NodeMediaServer from 'node-media-server';
import path = require('path');
import { createVerify } from 'crypto';
import { callbackify } from 'util';
import { Server } from 'net';
import { EventEmitter } from 'events';

const { FLVFile, FLVHeader, FLVTag } = type;

class Terminator extends Writable {
  constructor() {
    super({ objectMode: true });
  }

  _write(chunk, encoding, cb) {
    setImmediate(cb);
  }
}

class AudioExtractor extends Transform {
  header: typeof FLVHeader;
  tags: any[];
  start: number;
  prevSize = 0;
  wroteHeader = false;
  constructor() {
    super({ objectMode: true });
    this.header = new FLVHeader({
      version: 1,
      hasAudio: true,
      hasVideo: false,
    });
    this.tags = [];
  }

  _transform(obj, _, cb) {
    const { type, timestamp, data } = obj;
    if (type === 'audio') {
      this.tags.push(
        new FLVTag({ type: FLVTag.TagType.audio, timestamp, data }),
      );
      if (!this.start || timestamp - this.start > 750) {
        if (!this.wroteHeader) {
          this.wroteHeader = true;
          const flv = new FLVFile(this.header, this.tags);
          const byteLength = writeData(flv, null, 0);
          const buf = Buffer.alloc(byteLength);
          writeData(flv, buf, 0);
          this.prevSize = byteLength;
          cb(null, buf);
        } else {
          const byteLength = this.tags
            .map(t => writeData(t, null, 0))
            .reduce((p, c) => p + c, 0);
          const buf = Buffer.alloc(byteLength);
          let offset = 4;
          this.tags.forEach(t => {
            const base = writeData(t, buf, offset);
            offset = writer.writeNumber(base - offset, buf, base, 4);
          });
          this.prevSize = offset;
          cb(null, buf);
        }
        this.tags = [];
        this.start = timestamp;
      } else {
        cb();
      }
    } else {
      cb(null);
    }
  }
}

@Injectable({
  scope: Scope.DEFAULT,
})
export class StreamService {
  private server: any;
  private readable: Readable;
  constructor(private logger: AppLogger) {
    this.logger.setContext('RTMPServer');
  }
  startServer() {
    this.logger.debug('Started RTMP server');
    this.server = createSimpleServer('/stream');
    this.readable = this.server.pipe(new AudioExtractor());
  }

  stopServer() {
    (this.server as Readable).destroy();
    this.readable.destroy();
    this.logger.debug('Stopped RTMP server');
  }
  get stream(): Readable {
    return this.readable;
  }
}
