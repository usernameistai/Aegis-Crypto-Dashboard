import type { CryptoDataPoint } from '@/types/cryptoDataTypes';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface SparkLineProps {
  data: CryptoDataPoint[];
  sparklineUrl?: string;
}

const SparkLine = ({ data, sparklineUrl }: SparkLineProps) => {
  if ( sparklineUrl ) {
    return (
      <div className="h-10 w-24 flex items-center justify-center">
        <img 
          src={sparklineUrl} 
          alt=""
          className='w-full h-full object-contain' 
        />
      </div>
    )
  }
  
  return (
    <>
      <div className="h-10 w-24">
        <ResponsiveContainer width={100} height={100}>
        {/* <ResponsiveContainer width="100%" height="100%"> */}
          <LineChart data={data}>
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