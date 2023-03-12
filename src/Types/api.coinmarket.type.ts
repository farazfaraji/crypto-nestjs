export type CoinResponseData = {
  symbol: string;
  slug: string;
  last_updated: Date;
  quote: Quote;
};

export interface Quote {
  [currency: string]: Currency;
}

export type Currency = {
  price: number;

  last_updated: Date;
};
