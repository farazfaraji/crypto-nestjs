import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ExchangeRepositoryInterface } from '../interfaces/exchange.repository.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../redis.service';
import { CacheKey } from '../enums/cache-key.enum';
import { Coin } from '../Types/symbol.type';
import { Currency } from '../constants/currency.constant';
import { CoinDetail } from '../Types/coin-detail.type';
import { CoinResponseData } from '../Types/api.coinmarket.type';

@Injectable()
export class ExchangeRepository implements ExchangeRepositoryInterface {
  private readonly axiosInstance: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.axiosInstance = axios.create({
      baseURL: 'https://pro-api.coinmarketcap.com',
      headers: {
        'X-CMC_PRO_API_KEY': ` ${configService.get('EXCHANGE_API_KEY')}`,
      },
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // should handle locally
        console.error(error);
      },
    );
  }

  async getAllSymbols(): Promise<Coin[]> {
    const cacheSymbols = await this.cacheService.getCache<Coin[]>(
      CacheKey.Symbols,
    );
    if (cacheSymbols) {
      return cacheSymbols;
    }

    const response = await this.sendRequest<{ data: Coin[] }>({
      method: 'GET',
      url: `/v1/cryptocurrency/map`,
    });

    const data: Coin[] = response.data
      .filter((data) => data.is_active)
      .map((data) => {
        return {
          id: data.id,
          name: data.name,
          symbol: data.symbol,
          slug: data.slug,
          is_active: true,
        };
      });

    await this.cacheService.setCache(CacheKey.Symbols, data);
    return data;
  }

  async symbolExist(symbol: string): Promise<boolean> {
    const symbols = await this.getAllSymbols();
    return !!symbols.find((data) => data.symbol === symbol);
  }

  async getPriceBySymbols(symbols: string[]): Promise<CoinDetail[]> {
    const coinsDetail: CoinDetail[] = [];
    for (const currency of Object.keys(Currency)) {
      const response = await this.sendRequest<{ data: any }>({
        params: {
          symbol: symbols.join(','),
          convert: currency,
        },
        method: 'GET',
        url: `/v2/cryptocurrency/quotes/latest`,
      });

      for (const symbol of Object.keys(response.data)) {
        const coinData = response.data[symbol] as CoinResponseData[];
        if (coinData && coinData[0]) {
          const price = coinData[0].quote[currency].price;
          coinsDetail.push({
            currency,
            symbol,
            price,
            lastUpdate: new Date(coinData[0].quote[currency].last_updated),
          });
        } else {
          console.error(`information for ${symbol} in ${currency} not found`);
        }
      }
    }

    return coinsDetail;
  }

  async sendRequest<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance(config);

    return response.data as T;
  }
}
