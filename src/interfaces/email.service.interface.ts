import { CoinDetail } from '../Types/coin-detail.type';

export interface EmailServiceInterface {
  send(to: string, data: CoinDetail[]): Promise<void>;
}
