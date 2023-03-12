import { Coin } from '../Types/symbol.type';

export interface ExchangeRepositoryInterface {
  getAllSymbols(): Promise<Coin[]>;

  symbolExist(symbol: string): Promise<boolean>;
}
