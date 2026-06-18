import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig, } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import type { CryptoChartProps } from "@/types/cryptoDataTypes";

const cryptoChartConfig = { price: { label: "Price", color: "#hsl(var(--chart-1))", }} satisfies ChartConfig;

const CryptoChart = ({ data, days, onDaysChange }: CryptoChartProps) => {
  const selectValue = `${days}d`;

  return (
    <>
      <Card className="pt-0 shadow-lg shadow-neutral-500/50">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          
          <div className="grid flex-1 gap-1">
            <CardTitle className="text-xs md:text-base text-slate-500 font-bold">Asset Performance</CardTitle>
            <CardDescription className="text-[11px] md:text-sm">
              Crypto values for the selected timeframe 
            </CardDescription>
          </div>

          <div className="text-slate-700">
            <Select 
              value={selectValue} 
              onValueChange={(val) => {
                const safeVal = val ?? '90d';
                const num = parseInt(safeVal.replace('d', ''));
                onDaysChange(num);
              }}
            >
              <SelectTrigger
                className="hidden w-40 rounded-lg sm:ml-auto sm:flex"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Last 3 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="text-slate-700 rounded-lg">
                  Last 3 months
                </SelectItem>
                <SelectItem value="30d" className="text-slate-700 rounded-lg">
                  Last ~30d
                </SelectItem>
                <SelectItem value="7d" className="text-slate-700 rounded-lg">
                  Last 7d
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={days} // Changing the 'days' triggers the animation cycle
              initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <ChartContainer config={cryptoChartConfig} className="aspect-auto h-62.5 w-full" >
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#0d9488"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#0d9488"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString("en-UK", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fill: '#334155', fontSize: 10 }}
                    axisLine={false}                         
                    tickLine={false}                        
                    tickFormatter={(value) => `£${value.toLocaleString()}`}
                    width={40}                               
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-UK", {
                            month: "short",
                            day: "numeric",
                          })
                        }}
                        indicator="dot"
                        formatter={(value, name) => [
                          <>
                            <span className="p-1.25 rounded-xs bg-emerald-500"></span>
                            <span className="font-semibold text-[#808080]">{name}</span>
                            <span className="font-semibold">£{Number(value).toFixed(2).toLocaleString()}</span>,
                          </>
                        ]}
                      />
                    }
                  />
                  <Area
                    dataKey="price"
                    type="natural"
                    fill="url(#fillPrice)"
                    stroke="#0d9488"
                    stackId="a"
                  />
                  <ChartLegend
                    content={
                      <ChartLegendContent className="text-[#808080] font-bold"/>
                    } 
                  />
                </AreaChart>
              </ChartContainer>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </>
  )
};

export default React.memo(CryptoChart);