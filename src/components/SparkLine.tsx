import type { CryptoDataPoint } from '@/types/cryptoDataTypes';
import { XAxis, YAxis, Line, LineChart, ResponsiveContainer } from 'recharts';

interface SparkLineProps {
  data: CryptoDataPoint[];
  sparklineUrl?: string;
  className?: string;
}

const SparkLine = ({ data, sparklineUrl, className = "" }: SparkLineProps) => {
  const sparklineClass = `h-10 w-24 ml-auto flex items-center justify-end ${className}`

  if ( sparklineUrl ) {
    return (
      <div className={sparklineClass}>
        <img 
          src={sparklineUrl} 
          alt=""
          className="w-full h-full object-contain" 
        />
      </div>
    )
  }
  
  return (
    <>
      <div className={sparklineClass}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
            <XAxis dataKey="date" hide domain={['dataMin', 'dataMax']} />
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Line
              type="monotone" 
              dataKey="price" 
              stroke="#10b981" // emerald-500
              strokeWidth={2} 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  )
};

export default SparkLine;