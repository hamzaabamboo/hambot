import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import multiPart from '@fastify/multipart';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';
import { AppLogger } from './modules/logger/logger';

declare const module: any;
type FastifyWithNextPlugin = FastifyAdapter & {
  next: (route: string) => void;
};

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      pluginTimeout: 60000,
      bodyLimit: 52_428_800,
      // logger: true,
    }),
  );
  app.enableCors({
    origin: [
      'https://hamzaabamboo.github.io',
      'https://aibou.ham-san.net',
      'https://hamproductions.github.io',
    ],
    allowedHeaders: [
      'x-aibou-secret',
      'x-jisho-secret',
      'x-gemini-secret',
      'x-hambot-key',
      'content-type',
    ],
  });
  const config = app.get(AppConfigService);
  const port = config.PORT;
  const logger = await app.resolve(AppLogger);
  const fastify = app.getHttpAdapter().getInstance();

  await app.register(multiPart);

  app.enableShutdownHooks();

  // // 1. Generate the tree as text
  // const tree = SpelunkerModule.explore(app);
  // const root = SpelunkerModule.graph(tree);
  // const edges = SpelunkerModule.findGraphEdges(root);
  // const mermaidEdges = edges
  //   .filter( // I'm just filtering some extra Modules out
  //     ({ from, to }) =>
  //       !(
  //         from.module.name === 'ConfigHostModule' ||
  //         from.module.name === 'LoggerModule' ||
  //         to.module.name === 'ConfigHostModule' ||
  //         to.module.name === 'LoggerModule'
  //       ),
  //   )
  //   .map(({ from, to }) => `${from.module.name}-->${to.module.name}`);
  // console.log(`graph TD\n\t${mermaidEdges.join('\n\t')}`);

  try {
    if (config.NEXT) {
      fastify.register(import('@fastify/nextjs')).after(() => {
        (fastify as any).next('/');
        (fastify as any).next('/clipper');
      });
    }
  } catch (e) {
    console.log('NEXTJS ERROR', e);
  }

  const documentConfig = new DocumentBuilder()
    .setTitle('HamBot')
    .setDescription('HamBot Apis and such')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('api', app, document);

  logger.verbose('SSR Server Started');
  await app.listen(port ?? 3000, '0.0.0.0');
  logger.verbose('Listening to ' + (port ?? 3000));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
