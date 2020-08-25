import { Module, HttpModule } from '@nestjs/common';
import { IcalService } from './ical.service';

@Module({
  providers: [IcalService],
  exports: [IcalService],
  imports: [HttpModule],
})
export class IcalModule {}
