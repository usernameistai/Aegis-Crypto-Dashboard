import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { 
  PriceResponse,
  CryptoDataProps, 
  TrendingCoins 
} from "@/types/cryptoDataTypes";
import { toast } from "react-toastify";

const BASE = 'https://api.coingecko.com/api/v3';
const url1 = `${BASE}/coins/markets?vs_currency=gbp&order=market_cap_desc&per_page=250&page=1&sparkline=true`;
const trendingUrl = `${BASE}/search/trending`;

const fetchJson = async <T,>( url: string, signal: AbortSignal ): Promise<T> => {
  const res = await axios.get<T>(url, {
    headers: {
      'x-cg-demo-api-key': import.meta.env.VITE_COINGECKO_API_KEY  
    },
    signal
  });
  return res.data;
};

export const getCoins = (signal: AbortSignal) => {
  return fetchJson<CryptoDataProps[]>(url1, signal);
};

export const getTrends = async (signal: AbortSignal) => {
  const data = await fetchJson<TrendingCoins>(trendingUrl, signal);
  return data.coins.map(coin => coin.item);
};

export const useCoins = () => {
  return useQuery({
    queryKey: ['coins'],
    queryFn: ({ signal }) => getCoins(signal),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
};

export const usePriceData = (
  id: string,
  currency: string,
  days: number,
) => {
  return useQuery({
    queryKey: ['priceData', id, currency, days],
    queryFn: ({ signal }) => {
      const url2 = `${BASE}/coins/${id}/market_chart?vs_currency=${currency}&days=${days}`;

      return fetchJson<PriceResponse>(url2, signal);
    },
    staleTime: 1000 * 60 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useTrends = () => {
  return useQuery({
    queryKey: ['trends'],
    queryFn: ({ signal }) => toast.promise(
      getTrends(signal),
      { 
        pending: "Trending Data Fetching",
        success: "Well Slap My Thighs and call me Shirley",
        error: "I'm sorry Dave..."
      }
    ),
    staleTime: 1000 * 60 * 60 * 4,
    refetchOnWindowFocus: false,
  });
};
