import { Controller, Get, Param, Res, Header } from '@nestjs/common';
import qr from 'qr-image';
import { Response } from 'express';

@Controller('qrcode')
export class QrcodeController {
  //TODO: Add number below la
  @Get('/:payload')
  @Header('content-type', 'image/png')
  @Header('content-disposition', 'attachment; filename=qrcode.png')
  async generateQRCode(
    @Param('payload') payload: string,
    @Res() res: Response,
  ) {
    const qrImg = qr.image(payload, { type: 'png' });
    qrImg.pipe(res);
  }
}
