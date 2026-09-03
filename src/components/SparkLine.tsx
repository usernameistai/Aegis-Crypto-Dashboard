import type { CryptoDataPoint } from '@/types/cryptoDataTypes';
import { XAxis, YAxis, Line, LineChart, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from './ui/chart';

const cryptoChartConfig = { price: { label: "Price", color: "white", }} satisfies ChartConfig;

interface SparkLineProps {
  data: CryptoDataPoint[];
  sparklineUrl?: string;
  className?: string;
}

const SparkLine = ({ data, sparklineUrl, className = "" }: SparkLineProps) => {
  const sparklineClass = `h-10 w-24 ml-auto flex items-center justify-end overflow-visible z-50 ${className}`;
  const forIf = "w-full h-full object-contain";

  if ( sparklineUrl ) {
    return (
      <div className={sparklineClass}>
        <img src={sparklineUrl} alt="" className={forIf} />
      </div>
    )
  };

  const sparklineData = data && data.length > 1;

  const firstPrice = sparklineData ? data[0].price : 0;
  const lastPrice = sparklineData ? data[data.length - 1].price : 0;
  const isPositiveTrend = sparklineData && lastPrice > firstPrice;

  const strokeColour = isPositiveTrend ? '#10b981' : '#ef4444';
  
  return (
    <>
      <div className={sparklineClass}>
        <ChartContainer config={cryptoChartConfig} className='h-full w-full'>
          <ResponsiveContainer width={96} height={40}>
            <LineChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
              <XAxis dataKey="date" hide domain={['dataMin', 'dataMax']} />
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <Line
                type="monotone" 
                dataKey="price" 
                stroke={strokeColour} // emerald-500
                strokeWidth={2} 
                dot={false}
              />
              <ChartTooltip
                position={{ y: 42, x: -15 }}
                cursor={true}
                content={
                  <ChartTooltipContent
                    className="bg-white/95 border border-slate-200 shadow-lg rounded-md px-2 py-1.5 text-xs text-slate-700/80"
                    labelClassName="font-medium text-slate-400 mb-1 border-b border-slate-200 pb-0.5"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-UK", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                    indicator="dot"
                    formatter={(value, name) => [
                      <div key={`${name}-${value}`} className='z-50 flex items-center'>
                        <span className="inline-block h-3 w-2 px-1.25 pt-px rounded-xs mr-1" 
                          style={{ backgroundColor: strokeColour }} // Bypasses the Tailwind class-scanning limit cleanly
                        />
                        <span className="font-semibold text-[#808080] mr-1">{name}</span>
                        <span className="font-semibold">£{Number(value).toFixed(2).toLocaleString()}</span>
                      </div>
                    ]}
                  />
                }
              />
            </LineChart>
          </ResponsiveContainer>

        </ChartContainer>
      </div>
    </>
  )
};

export default SparkLine;