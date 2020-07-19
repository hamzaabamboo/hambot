import { Controller, Injectable, Scope } from '@nestjs/common';
import { createSimpleServer, createServer } from '@mediafish/rtmp-server';
import { print, writeData } from '@mediafish/flv';
import { AppLogger } from 'src/modules/logger/logger';
import { Readable, Writable } from 'stream';
import { createWriteStream } from 'fs';
import * as NodeMediaServer from 'node-media-server';

@Injectable({
  scope: Scope.DEFAULT,
})
export class StreamService {
  private server: any;
  private readable = new Readable({
    read() {},
  });
  constructor(private logger: AppLogger) {
    this.logger.setContext('RTMPServer');
    // this.server = createSimpleServer('/stream');
    // this.server.on('data', message => {
    //   const { type, data } = message;
    //   if (type === 'audio') {
    //     // const size = writeData(message.data, null, 0);
    //     // const b = Buffer.alloc(size);
    //     // writeData(message.data, b, 0);
    //     // this.readable.push(b);
    //     this.readable.push(data.data);
    //   }
    // });
    // this.server.on('error', () => {});
    // createServer({ port: 1935 }).once('/stream', conn => {
    //   conn.once('audioStream', stream => {
    //     stream.on('data', message => {
    //       const { type, data } = message;
    //       if (type === 'audio') {
    //         const size = writeData(message.data, null, 0);
    //         const b = Buffer.alloc(size);
    //         writeData(message.data, b, 0);
    //         this.readable.push(b);
    //         console.log(b);
    //         // this.readable.push(data.data);
    //       }
    //     });
    //   });
    // });

    const config = {
      rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: false,
        ping: 30,
        ping_timeout: 60,
      },
      http: {
        port: 8000,
        allow_origin: '*',
      },
    };

    const nms = new NodeMediaServer(config);
    nms.run();
    // this.readable.pipe(createWriteStream('./audio.m4a'));
  }
  get stream(): Readable {
    return this.readable;
  }
}
