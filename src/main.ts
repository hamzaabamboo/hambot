import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      pluginTimeout: 20000,
    }),
  );
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const fastify: FastifyAdapter = app.getHttpAdapter().getInstance();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  fastify.register(require('fastify-nextjs')).after(() => {
    (fastify as any).next('/hello');

    console.log('hi');
  }),
    app.enableShutdownHooks();
  await app.listen(port ?? 3000);
}
bootstrap();
