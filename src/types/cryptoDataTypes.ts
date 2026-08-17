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
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  market_cap_change_24h: number | null; // new
  market_cap_change_percentage_24h: number | null; // new
  circulating_supply: number;
  total_supply: number; // added | null
  max_supply: number | null; // added | null
  ath: number; // new
  ath_change_percentage: number; // new
  ath_date: string; // new
  atl: number; // new
  atl_change_percentage:  number; // new
  atl_date: string; // new
  last_updated: string; // new
  sparkline_in_7d: {
    price: number[];
  }
};

export interface CryptoTrendsProps {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
  data: {
    price: number;
    price_btc: string;
    market_cap: string;
    market_cap_btc: string;
    total_volume: string;
    total_volume_btc: string;
    sparkline: string;
  };
};

export interface TrendingCoins {
  coins: {
    item: CryptoTrendsProps;
  }[];
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

export interface CryptoTableProps {
  coins: CryptoDataProps[];
  historyData: Record<string, CryptoDataPoint[]>;
  trends: CryptoTrendsProps[];
  limit?: number;
};