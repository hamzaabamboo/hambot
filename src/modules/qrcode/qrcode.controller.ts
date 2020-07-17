import { Controller, Get, Param, Res, Header } from '@nestjs/common';
import * as qr from 'qr-image';
import { Response } from 'express';

@Controller('qrcode')
export class QrcodeController {
  @Get('/:payload')
  @Header('content-type', 'image/png')
  async generateQRCode(
    @Param('payload') payload: string,
    @Res() res: Response,
  ) {
    const qrImg = qr.image(payload, { type: 'png' });
    qrImg.pipe(res);
  }
}
