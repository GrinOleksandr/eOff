import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CherkoeService } from './cherkoe.service';
import { IGetScheduleResponseDto } from '../../common/dto';
import { ISchedule } from '../../common/types';
import { IGetMessageQueryDto } from './dto';
import { DAY, MESSAGE_TYPE } from './types/cherkoe.enums';

@Controller()
@ApiTags('Cherkoe')
export class CherkoeController {
  constructor(private readonly cherkoeService: CherkoeService) {
  }

  @Get()
  @ApiOperation({
    summary: 'Get schedule',
    description: 'Endpoint for getting the schedule of electricity cutoffs for CHERKOE provider',
    deprecated: true,
  })
  @ApiResponse({
    description: 'The schedule has been successfully received',
    type: IGetScheduleResponseDto,
    status: 200,
  })
  public async getSchedule_OLD(): Promise<ISchedule> { //ToDo remove this method in future after migration to the new one
    return this.cherkoeService.getSchedule();
  }

  @Get('schedule')
  @ApiOperation({
    summary: 'Get schedule',
    description: 'Endpoint for getting the schedule of electricity cutoffs for CHERKOE provider',
  })
  @ApiResponse({
    description: 'The schedule has been successfully received',
    type: IGetScheduleResponseDto,
    status: 200,
  })
  public async getSchedule(): Promise<ISchedule> {
    return this.cherkoeService.getSchedule();
  }

  @Get('message')
  @ApiOperation({
    summary: 'Get message for viber',
    description: 'Endpoint for getting formatted viber message for a particular day and particular queue',
  })
  @ApiResponse({
    description: 'The message has been successfully received',
    type: String,
    status: 200,
  })
  public async getMessage(@Query() query: IGetMessageQueryDto): Promise<String> {
    return this.cherkoeService.getMessage(query.type || MESSAGE_TYPE.NEW, query.queue || '1', query.day || DAY.TODAY);
  }


}
