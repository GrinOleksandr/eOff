import { ApiProperty } from '@nestjs/swagger';
import { ELECTRICITY_PROVIDER, ELECTRICITY_STATUS } from '../types';

export class EOffEventDto {
  @ApiProperty({
    type: String,
    example: "18:00",
    description: 'When event starts'
  })
  startTime: string;

  @ApiProperty({
    type: String,
    example: "19:00",
    description: 'When event ends'
  })
  endTime: string;

  @ApiProperty({
    type: String,
    example: "2",
    description: 'The queue of the event'
  })
  queue: string;

  @ApiProperty({
    type: String,
    example: "2024-09-02",
    description: 'Date of the event'
  })
  date: string;

  @ApiProperty({
    enum: ELECTRICITY_STATUS,
    example: ELECTRICITY_STATUS.OFF,
    description: 'Status of the electricity network'
  })
  electricity: ELECTRICITY_STATUS;

  @ApiProperty({
    enum: ELECTRICITY_PROVIDER,
    example: ELECTRICITY_PROVIDER.CHERKOE,
    description: 'Electricity service provider'
  })
  provider: ELECTRICITY_PROVIDER;
}

export class IGetScheduleResponseDto {
  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Indicates if response data contains a schedule for today'
  })
  hasTodayData: boolean;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Indicates if response data contains a schedule for tomorrow'
  })
  hasTomorrowData: boolean;

  @ApiProperty({ type: () => EOffEventDto })
  events: EOffEventDto[];
}
