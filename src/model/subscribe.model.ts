import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SubscribeModel {
  @ApiProperty({ type: String })
  @IsString()
  status: string;

  @ApiProperty({ type: String })
  @IsString()
  coin: string;

  @ApiProperty({ type: String })
  @IsString()
  message: string;
}
