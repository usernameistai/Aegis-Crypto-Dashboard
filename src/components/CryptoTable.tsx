import React from 'react';
import { Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import type { CryptoTableProps, CryptoDataProps, CryptoDataPoint, CryptoTrendsProps } from '@/types/cryptoDataTypes';
import SparkLine from './SparkLine';
import Cursor from './Cursor';

const right = "py-3 pr-4 text-right border-b border-slate-200";
const left = "py-3 pr-4 text-left border-b border-slate-200";
const hiddenTable = "hidden md:table-cell";

const CryptoRow = ({ coin, history, trend }: { coin: CryptoDataProps, history: CryptoDataPoint[], trend?: CryptoTrendsProps }) => {
  
  return (
    <TableRow className='relative font-semibold tabular-nums'>
      <TableCell className={`${left} pl-2`}>
        <div className="flex items-center">
          <img src={coin.image} alt={coin.name} className='h-5 w-5 my-auto mr-2'/>
          <div className=''>
            <div className='uppercase text-sm'>{coin.symbol}</div>
            <div className='text-xs'>{coin.name}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className={left}>{coin.market_cap_rank}</TableCell>
      <TableCell className='border-b border-slate-200'/>
      <TableCell className={right}>£{coin.current_price}</TableCell>
      <TableCell className={`${right} ${(coin.price_change_percentage_24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-600'}`}>{(coin.price_change_percentage_24h ?? 0) >= 0 ? '▲' : '▼'} {coin.price_change_percentage_24h ?? 0}%</TableCell>
      <TableCell className={`${right} ${hiddenTable}`}>£{coin.high_24h}</TableCell>
      <TableCell className={`${right} ${hiddenTable}`}>£{coin.low_24h}</TableCell>
      <TableCell className={`right ${(coin.price_change_24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-600'}`}>
        { coin.price_change_24h === null
          ? "£ N/A"
          : `${coin.price_change_24h >= 0 ? "▲" : "▼"} £${coin.price_change_24h.toFixed(4)}`
        }
      </TableCell>
      <TableCell className={`${right} ${hiddenTable}`}>{((coin.total_volume) / 1e9).toFixed(4)} B</TableCell>
      <TableCell className={`${right} ${(coin.market_cap_change_percentage_24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-600'}`}>{(coin.market_cap_change_percentage_24h ?? 0) >= 0 ? '▲' : '▼'} {coin.market_cap_change_percentage_24h ?? 0}%</TableCell>
      <TableCell className={right}>
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

const CryptoTable: React.FC<CryptoTableProps> = ({ coins, historyData, trends, limit, className }: CryptoTableProps ) => {

  return (
    <>
      <div className="relative bg-white/90 rounded-lg shadow-xl shadow-[#808080]/70 mx-3 my-5 px-3 py-2">
        <Table className={`text-slate-700/80 border-separate border-spacing-y-0 ${className}`}>
          <TableCaption className='top-0'>
            Top {limit} Crypto Coins by rank
          </TableCaption>
          <TableHeader className='p-4 m-4'>
            <TableRow className=''>
              <TableHead className={`${left} pl-2 w-32`}>Crypto Coin</TableHead>
              <TableHead className={`${left} pl-2`}>#</TableHead>
              <TableHead className="w-75 border-b border-slate-200" />
              <TableHead className={right}>Price</TableHead>
              <TableHead className={right}>
                <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <span className='inline-block align-middle'>Price 24h</span>
                  <Cursor className='align-middle ml-1'/>
                </div>
              </TableHead>
              <TableHead className={`${right} ${hiddenTable}`}>24h High</TableHead>
              <TableHead className={`${right} ${hiddenTable}`}>24h Low</TableHead>

              <TableHead className={right}>
                <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <span className='inline-block align-middle'>24h</span> 
                  <Cursor className='align-middle ml-1'/>
                </div>
              </TableHead>
              <TableHead className={`${right} ${hiddenTable}`}>Total Vol.</TableHead>


              <TableHead className={right}>
                <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <span className='inline-block align-middle'>Market Cap 24h</span>
                  <Cursor className='align-middle ml-1'/>
                </div>
              </TableHead>
              <TableHead className={right}>Last 7D</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='p-4 m-4 divide-y divide-slate-200/50'>
            {coins.slice(0, limit).map((coin) => {
              const trend = trends.find((trend) => trend.id === coin.id);

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