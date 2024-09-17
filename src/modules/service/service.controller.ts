import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Service')
export class ServiceController {
  @Get('/health')
  @ApiOperation({
    summary: 'Health check',
  })
  @ApiResponse({
    description: 'Status',
    status: 200,
  })
  public async getHEalthCheck() {
    return { status: 'ok' };
  }
}
