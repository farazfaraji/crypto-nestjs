import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRepository } from '../../repositories/exchange.repository';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../../redis.service';
import { Coin } from '../../Types/symbol.type';
import { CacheKey } from '../../enums/cache-key.enum';
import {
  MockAUD,
  MockBRL,
  MockEUR,
  MockGBP,
  MockUSD,
} from '../data/api-response.mock';

describe('ExchangeRepository', () => {
  let service: ExchangeRepository;
  let configService: ConfigService;
  let cacheService: CacheService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockCacheService = {
    getCache: jest.fn(),
    setCache: jest.fn(),
  };

  const symbolData: Coin[] = [
    {
      id: 1,
      symbol: 'BTC',
      name: 'Bitcoin',
      slug: 'Bitcoin',
      is_active: true,
    },
    {
      id: 2,
      symbol: 'ETH',
      name: 'Ether',
      slug: 'Ethereum',
      is_active: false,
    },
  ];

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRepository,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<ExchangeRepository>(ExchangeRepository);
    configService = module.get<ConfigService>(ConfigService);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch all symbols from the repository and save to cache', async () => {
    mockCacheService.getCache.mockReturnValue(null);
    jest.spyOn(service, 'sendRequest').mockResolvedValue({ data: symbolData });

    const response = await service.getAllSymbols();

    expect(mockCacheService.setCache).toHaveBeenCalledWith(
      CacheKey.Symbols,
      symbolData.filter((s) => s.is_active),
    );

    expect(response).toEqual(symbolData.filter((s) => s.is_active));
  });

  it('should use cache if exist', async () => {
    mockCacheService.getCache.mockReturnValue(
      symbolData.filter((s) => s.is_active),
    );

    const response = await service.getAllSymbols();

    expect(mockCacheService.setCache).not.toHaveBeenCalled();

    expect(response).toEqual(symbolData.filter((s) => s.is_active));
  });

  it('should return false if symbol not exist', async () => {
    jest.spyOn(service, 'getAllSymbols').mockResolvedValue([symbolData[0]]);

    const response = await service.symbolExist('TEST');

    expect(response).toBe(false);
  });

  it('should return price of a coin in all defined currency', async () => {
    const expectedData = [
      {
        currency: 'USD',
        symbol: 'BTC',
        price: 2,
        lastUpdate: new Date('1970-01-01T00:00:00.000Z'),
      },
      {
        currency: 'EUR',
        symbol: 'BTC',
        price: 2,
        lastUpdate: new Date('1970-01-01T00:00:00.000Z'),
      },
      {
        currency: 'BRL',
        symbol: 'BTC',
        price: 4,
        lastUpdate: new Date('1970-01-01T00:00:00.000Z'),
      },
      {
        currency: 'GBP',
        symbol: 'BTC',
        price: 9,
        lastUpdate: new Date('1970-01-01T00:00:00.000Z'),
      },
      {
        currency: 'AUD',
        symbol: 'BTC',
        price: 17,
        lastUpdate: new Date('1970-01-01T00:00:00.000Z'),
      },
    ];

    jest
      .spyOn(service, 'sendRequest')
      .mockResolvedValueOnce(MockUSD)
      .mockResolvedValueOnce(MockEUR)
      .mockResolvedValueOnce(MockBRL)
      .mockResolvedValueOnce(MockGBP)
      .mockResolvedValueOnce(MockAUD);

    const response = await service.getPriceBySymbols(['BTC']);

    expect(response).toEqual(expectedData);
  });
});
