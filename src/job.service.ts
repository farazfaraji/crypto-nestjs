import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ExchangeRepository } from './repositories/exchange.repository';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { CoinDetail } from './Types/coin-detail.type';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly exchangeService: ExchangeRepository,
    private readonly configService: ConfigService,
    @InjectQueue('send-mail')
    private readonly queue: Queue,
  ) {
    this.createJob();
  }

  async createJob() {
    // provide to run interval on tests
    if (this.configService.get<number>('EMAIL_INTERVAL_IN_SECONDS') > 10) {
      // can be upgraded to using BULLMQ jobs
      setInterval(
        () => this.start(),
        this.configService.get<number>('EMAIL_INTERVAL_IN_SECONDS') * 1000,
      );
    }
  }

  async start() {
    const users = await this.userRepository.find();
    const allRequestedCoins = await this.getAllRequestedCoins(users);
    const coinsDetail = await this.exchangeService.getPriceBySymbols(
      allRequestedCoins,
    );
    for (const user of users) {
      const data = coinsDetail.filter(
        (coinDetail) => coinDetail.symbol === user.coin,
      );
      await this.addToQueue(user.email, data);
    }
  }

  async getAllRequestedCoins(users: User[]): Promise<string[]> {
    const uniqueNames = new Set();

    users.forEach((item) => {
      uniqueNames.add(item.coin);
    });

    return Array.from(uniqueNames) as string[];
  }

  async addToQueue(email, data: CoinDetail[]) {
    await this.queue.add('user-data', { email, data });
  }
}
