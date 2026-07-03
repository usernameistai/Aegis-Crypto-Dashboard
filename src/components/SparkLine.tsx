import type { CryptoDataPoint } from '@/types/cryptoDataTypes';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface SparkLineProps {
  data: CryptoDataPoint[];
}

const SparkLine = ({ data }: SparkLineProps) => {
  console.log("Sparkline received:", data);
  
  return (
    <>
      <div className="h-10 w-24">
        <ResponsiveContainer width={100} height={100}>
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