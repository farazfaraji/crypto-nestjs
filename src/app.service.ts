import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { SubscribeDto } from './dto/subscribe.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { ExchangeRepository } from './repositories/exchange.repository';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly exchangeService: ExchangeRepository,
  ) {}

  async newSubscriber(subscribeDto: SubscribeDto): Promise<void> {
    try {
      const isSymbolExist = await this.exchangeService.symbolExist(
        subscribeDto.coin,
      );
      if (!isSymbolExist) {
        throw new Error(`${subscribeDto.coin} not exist`);
      }

      const user = this.userRepository.create({
        email: subscribeDto.email,
        coin: subscribeDto.coin,
      });

      await this.userRepository.save(user);
    } catch (e) {
      if (e instanceof QueryFailedError) {
        const error = e as any;
        if (error.code === '23505') {
          throw new ConflictException('Email already exists');
        }
      } else {
        throw new BadRequestException(e.message);
      }
    }
  }
}
