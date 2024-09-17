import { Module } from '@nestjs/common';
import { SimpleService } from './simple.service';
import { SimpleController } from './simple.controller';

@Module({
  controllers: [SimpleController],
  providers: [SimpleService],
  exports:[SimpleService]
})
export class SimpleModule {}