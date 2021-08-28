import { Module } from '@nestjs/common';
import { IcalService } from './ical.service';
import { HttpModule } from '@nestjs/axios';
@Module({
  providers: [IcalService],
  exports: [IcalService],
  imports: [HttpModule],
})
export class IcalModule {}
