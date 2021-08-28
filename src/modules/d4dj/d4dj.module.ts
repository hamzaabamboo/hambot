import { Module } from '@nestjs/common';
import { D4DJController } from './d4dj.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [],
  imports: [HttpModule],
  exports: [],
  controllers: [D4DJController],
})
export class D4DJModule {}
