import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { AppConfigModule } from 'src/config/app-config.module';

@Module({
  providers: [S3Service],
  imports: [AppConfigModule],
  exports: [S3Service],
})
export class S3Module {}
