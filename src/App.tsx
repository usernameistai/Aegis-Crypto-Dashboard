import React, { useEffect, useMemo, useState, useRef } from "react";
import type { FC } from "react";
import axios from "axios";
import type { CryptoDataProps, CryptoDataHistory, PriceResponse } from "./types/cryptoDataTypes";
import CryptoChart from "./components/CryptoChart";
import { LuSquareMenu } from "react-icons/lu";
import { themeConfig, preload_images } from "./config/themeConfig";
import CryptoField from "./components/CryptoField";

const App: FC<CryptoDataProps> = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [coins, setCoins] = useState<CryptoDataProps[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<CryptoDataProps | null>(null);
  const [priceData, setPriceData] = useState<PriceResponse | null>(null);
  const [params, setParams] = useState<CryptoDataHistory>({ id: `bitcoin`, currency: 'gbp', days: 90 });
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLInputElement>(null);

  const url1 = useMemo(() => `https://api.coingecko.com/api/v3/coins/markets?vs_currency=gbp&order=market_cap_desc&per_page=250&page=1`, []);
  const url2 = useMemo(() =>`https://api.coingecko.com/api/v3/coins/${params.id}/market_chart?vs_currency=${params.currency}&days=${params.days}`, [params]);
  
  useEffect(() => {
    // Preload images into browser cache
    preload_images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    document.body.className = `${themeConfig[currentIndex].className}`;
  }, [currentIndex]);

  useEffect(() => {
    const controller  = new AbortController();

    const fetchCoins = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get<CryptoDataProps[]>(url1, { signal: controller.signal });
        setCoins(res.data);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Coin list fetch error", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoins();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCryptoChartData = async () => {
      setPriceData(null);
      setIsLoading(true);
      try {
        const res = await axios.get(url2, { signal: controller.signal });
        setPriceData(res.data);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Coin list fetch error", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCryptoChartData();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const formattedData = useMemo(() => {
    if (!priceData?.prices) return [];
    return priceData 
      ? priceData.prices.map(([timestamp, price]) => ({ // : [number, number]
        date: new Date(timestamp).toISOString(),
        price: price,
        }))
      : [];
  }, [priceData]);

  const filteredCoins = useMemo(() => {
    if (!search) return [];

    return coins.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, coins]);

  const handleSelectCoin = (coin: CryptoDataProps) => { 
    setSelectedCoin(coin);

    setParams((prev) => ({
      ...prev,
      id: coin.id,
    }));
    setSearch(''); 

    if (menuRef.current) menuRef.current.checked = false;
    
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);
  };

  return (
    <>
      <div className="data-shield">
        <div className="min-h-screen bg-neutral-200/20 antialiased overflow-x-hidden">
          
          {isLoading && (
            <>
              <div className="fixed inset-0 w-screen h-screen bg-neutral-900/80 
                flex flex-col items-center justify-center z-9999 backdrop-blur-sm text-white">
                <p className="animate-pulse font-mono tracking-[0.3em] uppercase mb-4">
                  Syncing Mission Data...
                </p>

                <div className="frontier-loader">
                  <div className="outer-ring"></div>
                  <div className="middle-base">
                      <div className="middle-wavefront"></div>
                  </div>
                  <div className="inner-fill-empty"></div>
                </div>

              </div> 
            </>
          )}

          <div className={`flex backdrop-blur-md border border-white/10
            rounded-md p-1 shadow-[0_4px_30px_rgba(0,0,0,0.1)] justify-between
            ${themeConfig[currentIndex].label === 'Default' ? 'bg-neutral-400/50' : 'bg-white/5'}`}
          >
            {themeConfig.map((theme, idx) => (
              <button
                key={theme.label}
                onClick={() => {
                  setCurrentIndex(idx);
                  // document.body.className = `${theme.className}`;
                }}
                className={`px-2 py-1 text-[10px] md:text-[12px] lg:text-[14px] font-mono font-bold rounded-sm uppercase tracking-widest transition-all duration-300 hover:bg-white/10
                  ${currentIndex === idx 
                    ? 'bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                    : 'text-white/70 hover:text-white hover:bg-white/30'
                  }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
          
          <h1 className={`top-0 mt-3 mb-10 md:my-3 text-center text-[#808080]
            text-xl md:text-4xl uppercase font-black tracking-[0.225em]
            ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80' : 'text-[#808080]'}`}
          >
            Aegis Crypto Dashboard
          </h1>

          <div className="grid grid-cols-12 w-full overflow-x-hidden">
            <input 
              type="checkbox" 
              id="menu-toggle" 
              className="peer hidden"
              ref={menuRef}
            />
            <label 
              htmlFor="menu-toggle" 
              className="touch-manipulation md:hidden p-2 fixed top-18 left-2 z-50 
                bg-neutral900/50 backdrop-blur-sm border border-white/10 text-teal-500
                rounded-lg cursor-pointer flex items-center gap-2"
            >
              <div><LuSquareMenu size={24}/></div> 
              <div className="ml-1 font-mono font-semibold uppercase tracking-wider">Crypto Sidebar</div>
            </label>

            <aside 
              className="min-h-screen fixed inset-0 z-40 top-25 md:top-0 transform 
                transition-transform duration-300 translate-x-full peer-checked:translate-x-0 
                md:static md:col-span-3 lg:col-span-2 md:translate-x-0 peer-checked:left-0 md:block
              bg-[#808080]/10 backdrop-blur-md border-[1.5px] border-white/20 shadow-xl 
                shadow-[#808080]/70 shrink-0 p-2 md:p-4 m-2 md:m-4 rounded-lg
                overflow-y-auto touch-pan-y"
            > { /*  added overflow-y-auto overflow-scroll */ }

              <div className={`relative pb-4 mb-2 border-b uppercase text-left font-semibold
                ${themeConfig[currentIndex].label === 'Night' ? 'border-mist-200/20' : 'border-mist-900/20'}`}
              >
                <h2 className={`text-base md:text-lg
                  ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80 ' : 'text-slate-700/80'}
                `}>
                  Crypto // Assets
                </h2>
              </div>

              <form
                className="relative"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (filteredCoins.length > 0) handleSelectCoin(filteredCoins[0]);
                  if (menuRef.current) menuRef.current.checked = false;
                  setSearch('');
                }}
              >
                <input 
                  type="search"
                  value={search}
                  name="search" 
                  id="search" 
                  placeholder="Enter Crypto Coin"
                  className="bg-neutral-100 px-2 md:px-4 py-1 md:py-2 my-2 text-base
                    border border-neutral-300/50 focus:outline-none focus:ring-2
                  focus:ring-cyan-500 rounded-sm w-full inset-shadow-xl inset-shadow-black"
                  onChange={handleSearchChange}
                />
                <button
                  type="submit"
                  className="px-4 py-2 mb-4 text-neutral-100 text-base md:text-[17.5px] 
                    uppercase font-semibold bg-teal-500 hover:bg-teal-500/80 rounded-sm w-full 
                    tracking-wider shadow-lg/30 hover:shadow-none hover:translate-y-0.5 
                    focus:translate-y-0.5 focus:shadow-none"
                  onClick={() => {
                    if (menuRef.current) menuRef.current.checked = false;
                  }}
                >
                  Search
                </button>
                {/* Only show the list if the user has typed something */}
                {search && filteredCoins.length > 0 && (
                  <div className="absolute z-100 w-[88%] bg-neutral-800 text-white border
                   border-neutral-600 -mt-2.5 max-h-60 rounded-sm shadow-xl overflow-y-auto"
                  >
                    {filteredCoins.map((coin) => (
                      <button
                        type="button"
                        key={coin.id} 
                        className="px-4 py-2 mb-4 cursor-pointer hover:bg-cyan-900 transition-colors"
                        onClick={() => {
                          handleSelectCoin(coin);
                        }}
                      >
                        {coin.name}
                      </button>
                    ))}
                  </div>
                )}
              </form>
              
              {coins && 
                <div className="flex flex-col gap-y-2 text-slate-700/80">
                  {coins.slice(0, 11).map((c) => (
                    <button 
                      key={c.id}
                      className={`uppercase my-1 ml-2 md:ml-0 px-4 md:px-4 py-2 text-left text-[16px] 
                        md:text-base font-semibold border-[1.5px] border-mist-400/10 rounded-lg bg-white/10
                        hover:text-white hover:bg-teal-300/20 hover:border-mist-100/50
                        ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80' : 'text-slate-700/80'}
                        `}
                      onClick={() => {
                        setSelectedCoin(c);
                        setParams((prev) => ({ ...prev, id: c.id }));
                        if (menuRef.current) menuRef.current.checked = false;
                        // handleSelectCoin(c);
                      }}  
                    >
                      <h2>{c.id}</h2>
                    </button>
                  ))}
                </div>
              }
              
            </aside>

            <main className="min-h-screen col-span-12 md:col-span-9 lg:col-span-10
              bg-[#808080]/10 backdrop-blur-md border-[1.5px] border-white/20 
              shadow-xl shadow-[#808080]/70 shrink-0 p-4 m-2 md:m-4 rounded-lg"
            >
              {priceData &&
                <div className="pb-4 uppercase text-left font-semibold">
                  {selectedCoin ? (
                    <>
                    <div className="relative">
                      <h1 className={`flex justify-center md:justify-start pb-4 mb-4 text-base md:text-lg border-b
                        ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80 border-mist-200/20' : 'text-slate-700/80 border-mist-900/20'}`}
                      >
                        Aegis Crypto - {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()}) Databoard
                      </h1>
                      <div className="bg-neutral-700/20 p-3.5 md:p-5 rounded-lg shadow-lg shadow-neutral-500/50">
                        <div className={`border-b-2 pb-5 mb-5 flex justify-between items-end ${themeConfig[currentIndex].label === 'Night' ? 'border-neutral-200/70' : ' border-neutral-600/70'}`}>
                          <div>
                            <h1 className="text-lg md:text-3xl font-black text-white uppercase tracking-wide md:tracking-tighter">{selectedCoin.name}</h1>
                            <p className="text-[11px] md:text-base font-black uppercase tracking-wide text-teal-400 ">{selectedCoin.id} // {selectedCoin.symbol.toUpperCase()}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg md:text-3xl font-black text-white">£{`${selectedCoin.current_price <= 3 ? selectedCoin.current_price : selectedCoin.current_price.toLocaleString()}`}</div>
                            <div className="text-[11px] md:text-base font-black text-teal-400 uppercase tracking-wide">Current Price</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-5 mb-5">
                          <CryptoField label="24h Change" value={`${selectedCoin.price_change_percentage_24h.toFixed(2)}%`} subMetric={+(selectedCoin.price_change_24h.toFixed(5))} currentIndex={currentIndex} />
                          <CryptoField label="24h High" value={`£${selectedCoin.high_24h}`} currentIndex={currentIndex} />
                          <CryptoField label="24h Low" value={`£${selectedCoin.low_24h}`} currentIndex={currentIndex} />
                          <CryptoField label="Total Volume" value={`£${(selectedCoin.total_volume / 1e9).toFixed(2)}B`} currentIndex={currentIndex} />
                          <CryptoField label="Market Cap" value={`£${(selectedCoin.market_cap / 1e9).toFixed(2)}B`} currentIndex={currentIndex} />
                          <CryptoField label="Market Rank" value={`${selectedCoin.market_cap_rank}`} currentIndex={currentIndex} />
                          <CryptoField label="Circulating" value={`${(selectedCoin.circulating_supply / 1e6).toFixed(2)}M`} currentIndex={currentIndex} />
                          <CryptoField label="Max Supply" value={selectedCoin.max_supply ? `${(selectedCoin.max_supply / 1e6).toFixed(2)}M` : `∞`} currentIndex={currentIndex} />
                        </div>
                      </div>
                      
                      <div className="flex my-5 mx-auto justify-center">
                        {[7, 30, 90].map((day) => (
                          <button
                            key={day}
                            className={`px-5 md:px-7 py-1 md:py-1.5 mx-auto md:mx-0 rounded-full border text-xs ${
                              params.days === day
                                ? 'bg-neutral-800 text-white'
                                : 'bg-white/50 text-neutral-600 hover:bg-neutral-200'
                            }`}
                            onClick={() => setParams((prev) => ({ ...prev, days: day })) }
                          >
                            <span className="md:hidden">{day} days</span>
                          </button>
                        ))}
                      </div>
                    
                      <CryptoChart 
                        data={formattedData}
                        days={params.days}
                        onDaysChange={(newDays) => {
                          setParams((prev) => ({
                            ...prev,
                            days: newDays,
                          }));
                        }}
                      />
                      </div>
                    </>
                  ) : (
                    <>
                      <h1 className="flex justify-center pb-4 mb-4 text-base md:text-lg text-slate-700/80">Select a Cryptocurrency from sidebar to view data</h1>
                    </>
                  )}
                </div>
              }
            </main>

          </div>
        </div>

      </div>
      
    </>
  );
}

export default App;