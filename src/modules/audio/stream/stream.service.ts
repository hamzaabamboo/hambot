import { Injectable, Scope } from '@nestjs/common';
import { createServer } from '@mediafish/rtmp-server';
import { writer } from '@mediafish/buffer-operator';
import { writeData, type } from '@mediafish/flv';
import { AppLogger } from 'src/modules/logger/logger';
import { Readable, Transform } from 'stream';
import { generateRandomKey } from 'src/utils';
import { Server } from 'net';

const { FLVFile, FLVHeader, FLVTag } = type;

const BUFFER_SIZE = 750;
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
      if (!this.start || timestamp - this.start > BUFFER_SIZE) {
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
            .map((t) => writeData(t, null, 0))
            .reduce((p, c) => p + c, 0);
          const buf = Buffer.alloc(byteLength);
          let offset = 4;
          this.tags.forEach((t) => {
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
  async startServer(key: string = generateRandomKey()): Promise<string> {
    this.server = createServer({ port: 19350 });
    this.logger.debug('Started RTMP server for key ' + key);
    return key;
  }

  async listenToStream(key: string) {
    await new Promise((resolve, reject) => {
      this.server
        .once('/live', (conn) => {
          conn
            .once(key, (stream: Readable) => {
              this.readable = stream.pipe(new AudioExtractor());
              resolve(null);
            })
            .on('error', (e) => {
              this.stopServer();
              reject(e);
            });
        })
        .on('error', (e) => {
          this.stopServer();
          reject(e);
        });
    });
  }

  stopServer() {
    (this.server?.server as Server).close();
    this.readable?.destroy();
    this.logger.debug('Stopped RTMP server');
  }
  get stream(): Readable {
    return this.readable;
  }
}
