import { Test, TestingModule } from '@nestjs/testing';
import { QueryFailedError, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { SubscribeDto } from '../../dto/subscribe.dto';
import { AppService } from '../../app.service';
import { User } from '../../entities/user.entity';
import { ExchangeRepository } from '../../repositories/exchange.repository';

describe('AppService', () => {
  let service: AppService;
  let userRepository: Repository<User>;
  let exchangeRepository: ExchangeRepository;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockExchange = {
    symbolExist: jest.fn(),
  };

  const subscribeDto: SubscribeDto = {
    email: 'test@example.com',
    coin: 'BTC',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: ExchangeRepository,
          useValue: mockExchange,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    exchangeRepository = module.get<ExchangeRepository>(ExchangeRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    mockRepository.create.mockReturnValue(subscribeDto);
    mockExchange.symbolExist.mockReturnValue(true);

    await service.newSubscriber(subscribeDto);

    expect(userRepository.save).toHaveBeenCalledWith(subscribeDto);
  });

  it('should throw an Exception if symbol does not exist', async () => {
    mockExchange.symbolExist.mockReturnValue(false);

    await expect(service.newSubscriber(subscribeDto)).rejects.toThrow(
      new BadRequestException(`${subscribeDto.coin} not exist`),
    );
  });

  it('should throw an Exception if email already exists', async () => {
    // Simulate typeorm error on duplicate
    const queryFailedError = new QueryFailedError('', [], '');
    queryFailedError['code'] = '23505'; // Duplicate code error
    mockExchange.symbolExist.mockReturnValue(true);
    mockRepository.save.mockRejectedValueOnce(queryFailedError);

    await expect(service.newSubscriber(subscribeDto)).rejects.toThrow(
      new ConflictException('Email already exists'),
    );
  });
});
