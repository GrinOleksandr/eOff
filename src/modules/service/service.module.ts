import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { CherkoeService } from '../cherkoe';
import { CherkoeTgParser } from '../cherkoe/cherkoe-tg-parser.service';

@Module({
  controllers: [ServiceController],
  providers: [],
  exports: [],
})
export class ServiceModule {
}
