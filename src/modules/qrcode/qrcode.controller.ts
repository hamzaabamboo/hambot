import { Controller, Get, Param, Res, Header } from '@nestjs/common';
import qr from 'qr-image';
import { FastifyReply } from 'fastify';

@Controller('qrcode')
export class QrcodeController {
  //TODO: Add number below la
  @Get('/:payload')
  @Header('content-type', 'image/png')
  @Header('content-disposition', 'attachment; filename=qrcode.png')
  async generateQRCode(
    @Param('payload') payload: string,
    @Res() res: FastifyReply,
  ) {
    const qrImg = qr.image(payload, { type: 'png' });
    res.send(qrImg);
  }
}
