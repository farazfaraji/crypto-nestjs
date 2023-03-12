import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AcceptModel } from './model/accept.model';
import { SubscribeModel } from './model/subscribe.model';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): AcceptModel {
    return { status: 'ok' };
  }

  @Post('subscribe-me')
  async subscribeUser(
    @Body() subscribeDto: SubscribeDto,
  ): Promise<SubscribeModel> {
    await this.appService.newSubscriber(subscribeDto);
    return {
      status: 'ok',
      coin: subscribeDto.coin,
      message: 'subscription saved successfully',
    };
  }
}
