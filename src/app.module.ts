import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE, RouterModule } from '@nestjs/core';

import { ConfigModule } from '@nestjs/config';
import { ExceptionsFilter } from './common/filters';
import { CherkoeModule, ServiceModule } from './modules';

const routes = RouterModule.register([
  {
    path: '/cherkoe',
    module: CherkoeModule,
  },
  {
    path: '/service',
    module: ServiceModule,
  },
]);

const imports = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: `.env`,
  }),
  CherkoeModule,
  ServiceModule,
  routes,
];

const providers = [
  { provide: APP_FILTER, useClass: ExceptionsFilter },
  {
    provide: APP_PIPE,
    useValue: new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  },
];

@Module({
  imports,
  providers,
})
export class AppModule {
}
