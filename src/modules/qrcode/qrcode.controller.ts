import { Controller, Get, Param, Res } from '@nestjs/common';
import * as qr from 'qr-image';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('qrcode')
export class QrcodeController {
  @Get('/:payload')
  async generateQRCode(
    @Param('payload') payload: string,
    @Res() res: Response,
  ) {
    const qrImg = qr.image(payload, { type: 'png' });
    qrImg.pipe(res);
  }
}
