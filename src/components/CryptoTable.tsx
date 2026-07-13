import React from 'react';
import { Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import type { CryptoTableProps, CryptoDataProps, CryptoDataPoint } from '@/types/cryptoDataTypes';
import SparkLine from './SparkLine';

const CryptoRow = ({ coin, history }: { coin: CryptoDataProps, history: CryptoDataPoint[] }) => {
  return (
    <TableRow key={coin.id} className='font-semibold'>
      <TableCell className='flex'>
        <img src={coin.image} alt={coin.name} className='h-5 w-5 my-auto mr-2'/>
        <div className=''>
          <div className='uppercase text-sm'>{coin.symbol}</div>
          <div className='text-xs'>{coin.name}</div>
        </div>
      </TableCell>
      <TableCell>{coin.market_cap_rank}</TableCell>
      <TableCell>£{coin.current_price}</TableCell>
      <TableCell>£{coin.high_24h}</TableCell>
      <TableCell>£{coin.low_24h}</TableCell>
      {/* <TableCell className={`${(coin.price_change_24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-600'}`}>{coin.price_change_24h >= 0 ? '▲' : '▼'} £{coin.price_change_24h.toFixed(4)}</TableCell> */}
      <TableCell>
        { coin.price_change_24h === null
          ? "£ N/A"
          : `${coin.price_change_24h >= 0 ? "▲" : "▼"} £${coin.price_change_24h.toFixed(4)}`
        }
      </TableCell>
      <TableCell>{((coin.total_volume) / 1e9).toFixed(4)} B</TableCell>
      <TableCell className={`${(coin.price_change_percentage_24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-600'}`}>{(coin.price_change_percentage_24h ?? 0) >= 0 ? '▲' : '▼'} {coin.price_change_percentage_24h ?? 0}%</TableCell>
      <TableCell className={`${(coin.market_cap_change_percentage_24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-600'}`}>{(coin.market_cap_change_percentage_24h ?? 0) >= 0 ? '▲' : '▼'} {coin.market_cap_change_percentage_24h ?? 0}%</TableCell>
      <TableCell className="text-right"><SparkLine data={history}/></TableCell>
    </TableRow>
  )
}

const CryptoTable: React.FC<CryptoTableProps> = ({ coins, historyData }: CryptoTableProps) => {
    
  return (
    <>
      <div className="relative bg-white/70 rounded-lg shadow-xl shadow-[#808080]/70 mx-3 my-5 px-3 py-2">
        <Table className='text-slate-700/80'>
          <TableCaption className='top-0'>Top 11 Crypto Coins by rank</TableCaption>
          <TableHeader className='p-4 m-4'>
            <TableRow >
              <TableHead className="w-32">Crypto Coin</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Current Value</TableHead>
              <TableHead>24h High</TableHead>
              <TableHead>24h Low</TableHead>
              <TableHead>24h Change</TableHead>
              <TableHead>Total Volume</TableHead>
              <TableHead>Price Change 24h</TableHead>
              <TableHead>Market Cap Change 24h</TableHead>
              <TableHead>Sparkline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='p-4 m-4'>
            {coins.slice(0, 11).map((coin) => (
              <CryptoRow 
                key={coin.id} 
                coin={coin} 
                history={historyData[coin.id] || []}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default CryptoTable;