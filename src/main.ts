import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import morgan from 'morgan';
import helmet from 'helmet';
import { AppModule } from './app.module';

process.on('unhandledRejection', (reason: any, promise: any) => {
  Logger.error('unhandledRejection', reason, promise);
});

process.on('uncaughtException', (error: Error, source: any) => {
  Logger.error('uncaughtException', error, source);
});

async function bootstrap(): Promise<string> {
  const app = await NestFactory.create(AppModule);

  // ******* swagger setup
  const options = new DocumentBuilder()
    .setTitle('Electricity Off')
    .setDescription('eOff project Api Documentation')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`/swagger`, app, document);
  // *******

  // ******* global middlewares
  app.enableCors();
  app.use(helmet());
  app.use(morgan('combined'));
  // *******

  await app.listen(Number.parseInt(process.env.PORT || '8000', 10));
  return app.getUrl();
}

bootstrap()
  .then((url: string) => Logger.log(url, 'Bootstrap'))
  .catch((err: Error) => Logger.error(err, 'Bootstrap'));
