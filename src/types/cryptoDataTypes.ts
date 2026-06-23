export interface CryptoDataProps {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  circulating_supply: number;
  max_supply: number;
};

export interface CryptoDataHistory {
  id: string;
  currency: string;
  days: number;
};

export interface CryptoDataPoint {
  date: string;
  price: number;
};

export interface CryptoChartProps {
  data: CryptoDataPoint[];
  days: number;
  onDaysChange: (days: number) => void;
};

export interface PriceResponse {
  prices: [number, number][]; // Array of [timestamp, price]
};