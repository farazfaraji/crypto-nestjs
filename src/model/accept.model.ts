import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AcceptModel {
  @ApiProperty({ type: String })
  @IsString()
  status: string;
}
