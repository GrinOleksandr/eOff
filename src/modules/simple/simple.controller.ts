import { Controller, Get } from '@nestjs/common';
import { SimpleService } from './simple.service';

@Controller()
export class SimpleController {
  constructor(private readonly simpleService: SimpleService) {
    console.log('SimpleService in controller:', this.simpleService);
  }

  @Get()
  getHello(): string {
    return this.simpleService.getHello();
  }
}