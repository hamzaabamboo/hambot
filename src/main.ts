import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import register from '@react-ssr/nestjs-express/register';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  app.enableShutdownHooks();
  await register(app as any);
  await app.listen(port ?? 3000);
}
bootstrap();
