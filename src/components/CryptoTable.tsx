import React from 'react';
import { Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import type { CryptoTableProps, CryptoDataProps, CryptoDataPoint, CryptoTrendsProps } from '@/types/cryptoDataTypes';
import SparkLine from './SparkLine';
import Cursor from './Cursor';

const CryptoRow = ({ coin, history, trend }: { coin: CryptoDataProps, history: CryptoDataPoint[], trend?: CryptoTrendsProps }) => {
  return (
    <TableRow className='relative font-semibold tabular-nums'>
      <TableCell className='flex py-3 pl-2 pr-4 text-left'>
        <img src={coin.image} alt={coin.name} className='h-5 w-5 my-auto mr-2'/>
        <div className=''>
          <div className='uppercase text-sm'>{coin.symbol}</div>
          <div className='text-xs'>{coin.name}</div>
        </div>
      </TableCell>
      <TableCell className='py-3 pr-4 text-left'>{coin.market_cap_rank}</TableCell>
      <TableCell />
      <TableCell className='py-3 pr-4 text-right'>£{coin.current_price}</TableCell>
      <TableCell className={`py-3 pr-4 text-right ${(coin.price_change_percentage_24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-600'}`}>{(coin.price_change_percentage_24h ?? 0) >= 0 ? '▲' : '▼'} {coin.price_change_percentage_24h ?? 0}%</TableCell>
      <TableCell className='py-3 pr-4 text-right'>£{coin.high_24h}</TableCell>
      <TableCell className='py-3 pr-4 text-right'>£{coin.low_24h}</TableCell>
      <TableCell className={`py-3 pr-4 text-right ${(coin.price_change_24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-600'}`}>
        { coin.price_change_24h === null
          ? "£ N/A"
          : `${coin.price_change_24h >= 0 ? "▲" : "▼"} £${coin.price_change_24h.toFixed(4)}`
        }
      </TableCell>
      <TableCell className='py-3 pr-4 text-right'>{((coin.total_volume) / 1e9).toFixed(4)} B</TableCell>
      <TableCell className={`py-3 pr-4 text-right ${(coin.market_cap_change_percentage_24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-600'}`}>{(coin.market_cap_change_percentage_24h ?? 0) >= 0 ? '▲' : '▼'} {coin.market_cap_change_percentage_24h ?? 0}%</TableCell>
      <TableCell className="py-3 pr-4 text-right">
        {trend?.data?.sparkline ? (
          <img
            src={trend.data.sparkline}
            alt=""
            className="h-10 w-24 ml-auto object-contain"
          />
        ) : (
          <SparkLine data={history}/>
        )}
      </TableCell>
    </TableRow>
  )
};

const CryptoTable: React.FC<CryptoTableProps> = ({ coins, historyData, trends, limit }: CryptoTableProps ) => {
    
  return (
    <>
      <div className="relative bg-white/90 rounded-lg shadow-xl shadow-[#808080]/70 mx-3 my-5 px-3 py-2">
        <Table className='text-slate-700/80'>
          <TableCaption className='top-0'>
            Top {limit} Crypto Coins by rank
          </TableCaption>
          <TableHeader className='p-4 m-4'>
            <TableRow >
              <TableHead className="py-3 pl-2 pr-4 text-left w-32">Crypto Coin</TableHead>
              <TableHead className="py-3 pl-2 pr-4 text-left">#</TableHead>
              <TableHead className="w-75" />
              <TableHead className="py-3 pr-4 text-right">Price</TableHead>
              <TableHead className='py-3 pr-4 text-right'>
                <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <span className='inline-block align-middle'>Price 24h</span>
                  <Cursor className='align-middle ml-1'/>
                </div>
              </TableHead>
              <TableHead className="py-3 pr-4 text-right">24h High</TableHead>
              <TableHead className="py-3 pr-4 text-right">24h Low</TableHead>

              <TableHead className='py-3 pr-4 text-right'>
                <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <span className='inline-block align-middle'>24h</span> 
                  <Cursor className='align-middle ml-1'/>
                </div>
              </TableHead>
              <TableHead className='py-3 text-right'>Total Vol.</TableHead>


              <TableHead className='py-3 pr-4 text-right'>
                <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <span className='inline-block align-middle'>Market Cap 24h</span>
                  <Cursor className='align-middle ml-1'/>
                </div>
              </TableHead>
              <TableHead className='py-3 pr-4 text-right'>Last 7D</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='p-4 m-4'>
            {coins.slice(0, limit).map((coin) => {
              const trend = trends.find((trend) => trend.id === coin.id);

              // console.log("MATCHING TREND", trend);
              // console.log("TREND DATA:", trend?.data);
              return (
                <CryptoRow 
                  key={coin.id} 
                  coin={coin} 
                  history={historyData[coin.id] || []}
                  trend={trend}
                />
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default CryptoTable;