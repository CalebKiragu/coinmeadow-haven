export type CryptoCurrency = {
  symbol: string;
  name: string;
  price: number;
};

export type FiatCurrency = {
  code: string;
  symbol: string;
  name: string;
};

export const cryptoCurrencies: CryptoCurrency[] = [
  { symbol: 'ETH', name: 'Ethereum', price: 3450.20 },
  { symbol: 'BTC', name: 'Bitcoin', price: 65750.80 },
  { symbol: 'USDT', name: 'Tether', price: 1.00 },
  { symbol: 'USDC', name: 'USD Coin', price: 1.00 },
  { symbol: 'LTC', name: 'Litecoin', price: 80.45 },
  { symbol: 'BASE', name: 'Base', price: 0.95 },
];

export const fiatCurrencies: FiatCurrency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];