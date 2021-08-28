import { Module } from '@nestjs/common';
import { QrcodeController } from './qrcode.controller';

@Module({
  controllers: [QrcodeController],
})
export class QrcodeModule {}
