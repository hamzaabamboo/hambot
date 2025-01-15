import { Injectable } from '@nestjs/common';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { AppConfigService } from 'src/config/app-config.service';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket;
  constructor(appConfig: AppConfigService) {
    this.s3Client = new S3Client({
      region: appConfig.AWS_REGION,
      endpoint: appConfig.AWS_S3_UPLOAD_BUCKET_URL,
      forcePathStyle: true,
      credentials: {
        accessKeyId: appConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: appConfig.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucket = appConfig.AWS_S3_UPLOAD_BUCKET_NAME;
  }

  async uploadFile(file: Uint8Array, key: string) {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
      }),
    );
  }

  async getFile(key: string) {
    const res = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    return await res.Body.transformToByteArray();
  }

  async checkFileExist(key: string) {
    try {
      const res = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}
