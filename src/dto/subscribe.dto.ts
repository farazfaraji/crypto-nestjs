import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SubscribeDto {
  @ApiProperty({ type: String, example: 'info@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, example: 'BTC' })
  @IsString()
  coin: string;
}
