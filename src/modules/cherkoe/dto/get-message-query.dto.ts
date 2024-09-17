import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DAY, MESSAGE_TYPE } from '../types/cherkoe.enums';



export class IGetMessageQueryDto {
  @ApiProperty({
    required: false,
    default: MESSAGE_TYPE.NEW,
  })
  @IsOptional()
  @IsEnum(MESSAGE_TYPE)
  type?: MESSAGE_TYPE;

  @ApiProperty({
    required: false,
    default: DAY.TODAY,
  })
  @IsOptional()
  @IsEnum(DAY)
  day?: DAY;

  @ApiProperty({
    type: String,
    required: false,
    default: '1',
  })
  @IsOptional()
  queue?: string;
}
