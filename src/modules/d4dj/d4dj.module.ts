import { HttpModule, Module } from '@nestjs/common';
import { D4DJController } from './d4dj.controller';

@Module({
  providers: [],
  imports: [HttpModule],
  exports: [],
  controllers: [D4DJController],
})
export class D4DJModule {}
