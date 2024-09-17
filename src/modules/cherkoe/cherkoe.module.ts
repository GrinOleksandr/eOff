import { Module } from '@nestjs/common';
import { CherkoeService } from './cherkoe.service';
import { CherkoeController } from './cherkoe.controller';
import { CherkoeTgParser } from './cherkoe-tg-parser.service';

@Module({
  controllers: [CherkoeController],
  providers: [CherkoeService, CherkoeTgParser],
  exports: [CherkoeService, CherkoeTgParser],
})
export class CherkoeModule {}
