export interface CryptoDataProps {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number; // new
  market_cap_change_percentage_24h: number; // new
  circulating_supply: number;
  total_supply: number; // new
  max_supply: number;
  ath: number; // new
  ath_change_percentage: number; // new
  ath_date: string; // new
  atl: number; // new
  atl_change_percentage:  number; // new
  atl_date: string; // new
  last_updated: string; // new
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