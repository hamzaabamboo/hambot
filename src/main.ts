import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AppLogger } from './modules/logger/logger';

type FastifyWithNextPlugin = FastifyAdapter & {
  next: (route: string) => void;
};

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      pluginTimeout: 60000,
      // logger: true,
    }),
  );
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const logger = await app.resolve(AppLogger);
  const fastify: FastifyWithNextPlugin = app.getHttpAdapter().getInstance();

  app.enableShutdownHooks();

  try {
    await fastify.register(import('fastify-nextjs'));
    fastify.next('/');
    fastify.next('/clipper');
  } catch (e) {
    console.log(e);
  }

  logger.verbose('SSR Server Started');
  await app.listen(port ?? 3000, '0.0.0.0');
  logger.verbose('Listening to ' + (port ?? 3000));

  // if (module.hot) {
  //   module.hot.accept();
  //   module.hot.dispose(() => app.close());
  // }
}
bootstrap();
