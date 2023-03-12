import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from '../../job.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { ExchangeRepository } from '../../repositories/exchange.repository';
import { ConfigService } from '@nestjs/config';
import { CoinDetail } from '../../Types/coin-detail.type';
import { getQueueToken } from '@nestjs/bull';

describe('JobService', () => {
  let service: JobService;

  const mockRepository = {
    find: jest.fn(),
  };

  const mockExchange = {
    getPriceBySymbols: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: ExchangeRepository,
          useValue: mockExchange,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getQueueToken('send-mail'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch all users from the user repository and push data to the queue', async () => {
    const users: User[] = [
      { id: 1, email: 'user1@example.com', coin: 'BTC' },
      { id: 2, email: 'user2@example.com', coin: 'ETH' },
    ];

    const coinDetails: CoinDetail[] = [
      { currency: 'USD', symbol: 'BTC', price: 1000, lastUpdate: null },
      { currency: 'USD', symbol: 'ETH', price: 1000, lastUpdate: null },
    ];

    mockRepository.find.mockResolvedValue(users);
    mockExchange.getPriceBySymbols.mockResolvedValue(coinDetails);

    jest.spyOn(service, 'addToQueue').mockImplementation(async () => {});

    await service.start();

    expect(service.addToQueue).toHaveBeenNthCalledWith(1, users[0].email, [
      coinDetails[0],
    ]);

    expect(service.addToQueue).toHaveBeenNthCalledWith(2, users[1].email, [
      coinDetails[1],
    ]);
  });
});
