
export type CryptoCurrency = {
  symbol: string;
  name: string;
  price: number;
  details?: string;
};

export type FiatCurrency = {
  code: string;
  symbol: string;
  name: string;
};

export type Country = {
  code: string;
  name: string;
};

export const cryptoCurrencies: CryptoCurrency[] = [
  { symbol: "BTC", name: "Bitcoin", price: 65750.8 },
  { symbol: "ETH", name: "Ethereum", price: 3450.2, details: "Supports native ERC-20 tokens" },
  { symbol: "LTC", name: "Litecoin", price: 80.45 },
  { symbol: "CELO", name: "Celo", price: 0.95, details: "Supports cUSD" },
];

export const fiatCurrencies: FiatCurrency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
  { code: "TSH", symbol: "TSh", name: "Tanzanian Shilling" },
  { code: "RWF", symbol: "R₣", name: "Rwandan Franc" },
  { code: "ETB", symbol: "Br", name: "Ethiopian Birr" },
];

export const countries: Country[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "GH", name: "Ghana" },
  { code: "UG", name: "Uganda" },
  { code: "TZ", name: "Tanzania" },
  { code: "RW", name: "Rwanda" },
  { code: "ET", name: "Ethiopia" },
];
