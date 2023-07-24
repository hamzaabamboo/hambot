import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';
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
  app.enableCors({
    origin: ['https://hamzaabamboo.github.io', 'https://aibou.ham-san.net'],
    allowedHeaders: ['x-aibou-secret', 'content-type'],
  });
  const config = app.get(AppConfigService);
  const port = config.PORT;
  const logger = await app.resolve(AppLogger);
  const fastify = app.getHttpAdapter().getInstance();

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
      await fastify.register(import('@fastify/nextjs'));
      fastify.next('/');
      fastify.next('/clipper');
    }
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
