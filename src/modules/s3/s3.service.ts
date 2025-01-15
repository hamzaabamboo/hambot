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

  async uploadFile(file: File, key: string) {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: new Uint8Array(await file.arrayBuffer()),
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
    return new File(
      [await res.Body.transformToByteArray()],
      key.split('/').at(-1),
    );
  }

  async checkFileExist(key: string) {
    try {
      console.log(this.bucket, key);
      const res = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
