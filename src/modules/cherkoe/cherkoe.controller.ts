import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CherkoeService } from './cherkoe.service';
import { IGetScheduleResponseDto } from '../../common/dto';
import { ISchedule } from '../../common/types';
import { cherkoeService } from '../../../src_old/services/cherkoe';

@Controller()
@ApiTags('Cherkoe')
export class CherkoeController {
  constructor(private readonly cherkoeService: CherkoeService) {
    console.log('CherkoeController initialized');
    console.log('CherkoeService in controller:', this.cherkoeService); // Should not be undefined
  }

  @Get()
  @ApiOperation({
    summary: 'Endpoint for getting the schedule of electricity cutoffs for CHERKOE provider',
    description: 'Endpoint for getting the a list of all trackings',
  })
  @ApiResponse({
    description: 'The schedule has been successfully received',
    type: IGetScheduleResponseDto,
    status: 200,
  })
  public async getSchedule():Promise<ISchedule> {
    console.log('cherkoe service in controller', this.cherkoeService)
    return this.cherkoeService.getSchedule();
    // return { hasTodayData:true, hasTomorrowData:true, events: [] };
  }


}
