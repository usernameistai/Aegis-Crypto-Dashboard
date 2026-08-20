import React, { useEffect, useMemo, useState, useRef, type FC } from "react";
import axios from "axios";
import { type CryptoDataProps, type CryptoTrendsProps, type CryptoDataHistory, type PriceResponse, type CryptoDataPoint, type TrendingCoins, type CryptoDescriptionProps } from "./types/cryptoDataTypes";
import CryptoChart from "./components/CryptoChart";
import CryptoField from "./components/CryptoField";
import CryptoTable from "./components/CryptoTable";
import { themeConfig, preload_images } from "./config/themeConfig";
import { LuSquareMenu } from "react-icons/lu";
import { ChartCandlestick, Flame, LayoutDashboard, TrendingUp, TrendingUpDown } from "lucide-react";
import TrendSparkLine from "./components/TrendSparkLine";
import { Flip, ToastContainer, toast } from 'react-toastify';

const App: FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [coins, setCoins] = useState<CryptoDataProps[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<CryptoDataProps | null>(null);
  const [priceData, setPriceData] = useState<PriceResponse | null>(null);
  const [params, setParams] = useState<CryptoDataHistory>({ id: `bitcoin`, currency: 'gbp', days: 90 });
  const [trends, setTrends] = useState<CryptoTrendsProps[]>([]);
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isDataExpanded, setIsDataExpanded] = useState(false);
  const menuRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const BASE = 'https://api.coingecko.com/api/v3';
  const trendingUrl = useMemo(() => `${BASE}/search/trending`, []);
  const url1 = useMemo(() => `${BASE}/coins/markets?vs_currency=gbp&order=market_cap_desc&per_page=250&page=1&sparkline=true`, []);
  const url2 = useMemo(() => `${BASE}/coins/${params.id}/market_chart?vs_currency=${params.currency}&days=${params.days}`, [params.id, params.currency, params.days]);
  const descripionUrl = useMemo(() => `${BASE}/coins/${params.id}?tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`, [params.id]);
  
  useEffect(() => {
    let loadedCount = 0;

    preload_images.forEach((src) => {
      const img = new Image();
      img.src = src;

      img.onload = () => {
      loadedCount++;
      if (loadedCount === preload_images.length) {
          setIsLoading(false);
        }
      };

    img.onerror = () => {
      loadedCount++;
      if (loadedCount === preload_images.length) {
          setIsLoading(false);
        }
      };
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
    });
  }, []);

  useEffect(() => {
    document.body.className = themeConfig[currentIndex].className;
  }, [currentIndex]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTrends = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get<TrendingCoins>(trendingUrl, { 
          headers: { 'x-cg-demo-api-key': import.meta.env.VITE_COINGECKO_API_KEY }, 
          signal: controller.signal 
        });
        setTrends(res.data.coins.map(coin => coin.item));
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Coin trend list fetch error", err);
      } finally {
        setIsLoading(false);
      }
    }
    toast.promise(
      fetchTrends(),
      {
        pending: "Trending Data Fetching",
        success: "Well Slap My Thighs and call me Shirley",
        error: "I'm sory Dave..."
      }
    )
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const controller  = new AbortController();

    const fetchCoins = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get<CryptoDataProps[]>(url1, { 
          headers: { 'x-cg-demo-api-key': import.meta.env.VITE_COINGECKO_API_KEY }, 
          signal: controller.signal 
        });
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
        const res = await axios.get<PriceResponse>(url2, { 
          headers: { 'x-cg-demo-api-key': import.meta.env.VITE_COINGECKO_API_KEY }, 
          signal: controller.signal 
        });
        setPriceData(res.data);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Coin list fetch error", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCryptoChartData();
    return () => controller.abort();
  }, [url2]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDescriptionData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get<CryptoDescriptionProps>(descripionUrl, { 
          headers: { 'x-cg-demo-api-key': import.meta.env.VITE_COINGECKO_API_KEY }, 
          signal: controller.signal 
        });
        setDescription(res.data.description?.en);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Coin description fetch error", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDescriptionData();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const sparkLineData = useMemo(() => {
    const result: Record<string, CryptoDataPoint[]> = {};

    coins.forEach((coin) => {
      // if (!coin.sparkline_in_7d?.price) return;

      // result[coin.id] = coin.sparkline_in_7d.price.map((p: number, i: number) => ({
      //   date: new Date(Date.now() - (coin.sparkline_in_7d!.price.length - 7 - i) * 24 * 3600 * 1000).toISOString(),
      //   price: p,
      // }));

      const prices = coin.sparkline_in_7d?.price;

      if (!prices) return;

      const interval = (7 * 24 * 60 * 60 * 1000) / prices.length;

      result[coin.id] = prices.map((price, i) => ({
        date: new Date(
          Date.now() - (prices.length - 1 - i) * interval
        ).toISOString(),
        price,
      }));
    });
    // added coins.sparkline_in_7d!.price.length -

    return result;
  }, [coins]);

  const formattedData = useMemo(() => {
    if (!priceData?.prices) return [];
    // return priceData 
    //   ?
    return priceData.prices.map(([timestamp, price]) => ({ // : [number, number]
        date: new Date(timestamp).toISOString(),
        price: price,
      }));
      // : [];
  }, [priceData]);

  const filteredCoins = useMemo(() => {
    if (!search) return [];

    return coins.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, coins]);

  const handleCryptoTrend = (trend: CryptoTrendsProps ) => {    
    const coin = coins.find((coin) => coin.id === trend.id);

    if (!coin) {
      console.log(`No matching coin found for ${trend.id}`);
      toast.warn(`No matching coin data found for ${trend.id}`);
      return;
    };
    setSelectedCoin(coin);
    setParams((prev) => ({
      ...prev,
      id: coin.id,
    }));
    if (menuRef.current) menuRef.current.checked = false;
    
  };

  const handleSelectCoin = (coin: CryptoDataProps) => { 
    setSelectedCoin(coin);

    setParams((prev) => ({
      ...prev,
      id: coin.id,
    }));
    setSearch(''); 
    setDescription('');

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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.relatedTarget && e.currentTarget.form?.contains(e.relatedTarget)) {
      return;
    }

    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    };
    
    blurTimeoutRef.current = setTimeout(() => {
      setSearch('');
    }, 200);
  };

  const getFirstWord = (htmlString: string) => {
    if (!htmlString) return '';
    const cleanText = htmlString.replace(/<[^>]*>/g, '');
    
    return cleanText.trim().split(' ')[0];
  };

  
  return (
    <>
      <div className="data-shield" aria-hidden={isLoading ? "true" : "false"}>
        <div className="relative h-dvh bg-neutral-200/20 antialiased overflow-x-hidden">
          
          {isLoading && (
            <>
              <div role="status" aria-live="polite" aria-label="Loading Crypto Data"
                className="fixed inset-0 w-screen h-screen bg-neutral-900/80 
                flex flex-col items-center justify-center z-200 backdrop-blur-sm text-white">
                <p className="animate-pulse font-mono tracking-[0.3em] uppercase mb-4">
                  Syncing Crypto Data...
                </p>

                <div className="frontier-loader" aria-hidden="true">
                  <div className="outer-ring"></div>
                  <div className="middle-base">
                      <div className="middle-wavefront"></div>
                  </div>
                  <div className="inner-fill-empty"></div>
                </div>

              </div> 
            </>
          )}

          {themeConfig.map((_, idx) => (
            <div
              key={idx}
              className={`theme-layer bg-layer-${idx} ${currentIndex === idx ? 'theme-active' : ''}`}
            />
          ))}

          <section aria-label="Theme selection"
            className={`flex backdrop-blur-md border border-white/10
            rounded-md p-1 shadow-[0_4px_30px_rgba(0,0,0,0.1)] justify-between
            ${themeConfig[currentIndex].label === 'Default' ? 'bg-neutral-400/30' : 'bg-white/5'}`}
          >
            {themeConfig.map((theme, idx) => (
              <button
                key={theme.label}
                role="tab"
                aria-pressed={currentIndex === idx ? true : false}
                onClick={() => setCurrentIndex(idx)}
                className={`px-2 py-1 text-[10px] md:text-[12px] lg:text-[14px] font-semibold rounded-sm uppercase tracking-widest transition-all duration-300 hover:bg-white/10 hover:font-bold
                  ${currentIndex === idx 
                    ? 'bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                    : 'text-white/70 hover:text-white hover:bg-white/30'
                  }`}
              >
                {theme.label}
              </button>
            ))}
          </section>

          <ToastContainer 
            theme="dark" 
            position="top-right"
            closeOnClick
            draggable
            stacked
            newestOnTop
            transition={Flip}
            toastClassName="toast"
            progressClassName="progress"
            autoClose={1250}
          />
          
          <h1 className={`top-0 mt-3 mb-10 md:my-3 text-center text-[#808080]
            text-xl md:text-4xl uppercase font-black tracking-[0.225em]
            ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80' : 'text-[#808080]'}`}
          >
            Aegis Crypto Dashboard
          </h1>

          {/* Trending Crypto Coins */}
          <section className={`flex bg-[#808080]/10 backdrop-blur-md border-[1.5px] border-white/20 shadow-xl 
            shadow-[#808080]/60 p-2 md:p-4 m-4 rounded-lg
            ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80 ' : 'text-slate-700/80'}`}
          >
            <div className="flex w-full flex-col items-center">
              <div className={`flex w-full items-center border-b mb-2 pb-2
                ${themeConfig[currentIndex].label === 'Night' ? 'border-mist-200/20' : 'border-mist-900/20'}
              `}>
                <Flame className="h-5 w-5 text-orange-500 mr-1" strokeWidth={3}/>
                <h2 className="text-base md:text-lg uppercase font-semibold">
                  Trending Aegis Crypto
                </h2>
              </div>
              <div className="flex w-full items-center gap-1">
                {trends.slice(0, 8).map((trend, index) => (
                  <button key={trend.id} 
                    className={`flex flex-1 items-center justify-between border-2 border-white/10 bg-[#808080]/20 px-2 py-1 
                      rounded-lg shadow-md hover:shadow-lg hover:border-cyan-300 gap-1 cursor-pointer
                      focus:outline-none
                      ${ index <= 1 
                          ? "flex"
                          : index <= 4 
                            ? "hidden md:flex"
                            : "hidden lg:flex"
                      }
                      ${themeConfig[currentIndex].label === 'Night' ? 'hover:bg-white/20' : 'hover:bg-white/10'}
                    `}
                    onClick={() => handleCryptoTrend(trend)}
                  >
                    <img 
                      src={trend.small} 
                      alt={trend.name} 
                      className="w-5 h-5 md:w-8 md:h-8 my-auto"
                    />
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-[11px] md:text-xs lg:text-sm hidden md:flex">{trend.name}</span>
                      <span className="text-[9px] md:text-[11px] lg:text-xs">{trend.symbol}</span>
                    </div>
                    <TrendSparkLine 
                      src={trend.data.sparkline} 
                      className="w-15 h-10 pl-2"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Menu Select for Coins */}
          <div className="relative grid grid-cols-12">
            <input 
              type="checkbox" 
              id="menu-toggle" 
              className="peer hidden"
              ref={menuRef}
            />
            <label 
              htmlFor="menu-toggle" 
              className="touch-manipulation md:hidden p-2 fixed top-17 left-4 z-50 
                bg-neutral900/50 backdrop-blur-sm border border-white/10 text-teal-500
                rounded-lg cursor-pointer flex items-center gap-2"
              role="button"
              aria-label="Toggle Crypto Sidebar Menu"
              aria-expanded={isOpen}
              onClick={() => setIsOpen(!isOpen)}
              aria-controls="Crypto-Sidebar"
            >
              <div><LuSquareMenu size={24}/></div> 
              <div className="ml-1 font-mono font-semibold uppercase tracking-wider">Crypto Sidebar</div>
            </label>
            
            <aside 
              className="min-h-dvh fixed md:static z-100 top-25 right-0 bottom-0 left-0 md:top-0 transform 
                transition-transform duration-300 translate-x-full peer-checked:translate-x-0 
                 md:col-span-3 lg:col-span-2 md:translate-x-0 peer-checked:left-0
              bg-[#808080]/10 backdrop-blur-md border-[1.5px] border-white/20 shadow-xl 
                shadow-[#808080]/70 p-2 md:p-4 m-4 rounded-lg
                overflow-y-auto touch-pan-y overscroll-contain"
              id="Crypto-Sidebar"
              aria-labelledby="Crypto-Menu-Title"
            >

              <div className={`relative pb-4 mb-2 border-b uppercase text-left font-semibold
                ${themeConfig[currentIndex].label === 'Night' ? 'border-mist-200/20' : 'border-mist-900/20'}`}
              >
                <div className="flex items-center">
                  <ChartCandlestick className="mr-1 text-teal-500"/>
                  <h2 
                    id="Crypto-Menu-Title"
                    className={`text-base md:text-lg
                      ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80 ' : 'text-slate-700/80'}
                    `}
                  >
                    Crypto Coin
                  </h2>
                </div>
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
                <label htmlFor="search" className="sr-only">Search for a Cryptocurrency</label>
                <input 
                  type="search"
                  value={search}
                  name="search" 
                  id="search"
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-expanded={search.length > 0 && filteredCoins.length > 0}
                  aria-controls="Crypto-Coin-List"
                  placeholder="Enter Crypto Coin"
                  className="w-[95%] md:w-full bg-neutral-100 px-4 py-2 m-2 md:m-0 md:my-2 text-base
                    border border-neutral-300/50 focus:outline-none focus:ring-2
                  focus:ring-cyan-500 rounded-sm inset-shadow-xl inset-shadow-black"
                  onChange={handleSearchChange}
                  onBlur={handleBlur}
                />
                <button
                  type="submit"
                  className="w-[95%] md:w-full px-4 py-2 mx-2 md:mx-0 mb-4 text-neutral-100 text-base md:text-[17.5px] 
                    uppercase font-semibold bg-teal-500 hover:bg-teal-500/80 rounded-sm 
                    tracking-wider shadow-md/30 hover:shadow-none hover:translate-y-0.5 
                    focus:translate-y-0.5 focus:shadow-none"
                  onClick={() => {
                    if (menuRef.current) menuRef.current.checked = false;
                  }}
                >
                  Search
                </button>
                
                {search && filteredCoins.length > 0 && (
                  <div 
                    id="Crypto-Coin-List"
                    role="listbox"
                    className="absolute z-100 w-[88%] bg-cyan-800 text-white border
                    border-neutral-600 -mt-2.5 max-h-60 rounded-sm shadow-xl overflow-y-auto"
                    aria-live="polite"
                  >
                    {filteredCoins.map((coin) => (
                      <button
                        type="button"
                        key={coin.id}
                        role="option"
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
                <nav aria-label="Crypto Coin Selection">
                  <ul className="flex flex-col gap-y-2 text-slate-700/80">
                    {coins.slice(0, 11).map((c) => (
                      <li key={c.id}>
                        <button 
                          className={`w-[95%] md:w-full uppercase my-1 ml-2 md:ml-0 px-4 md:px-4 py-2 text-left text-[16px] 
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
                          {c.id}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              }
              
            </aside>

            {/* Main Data Dashboard */}
            <main className="relative min-h-dvh col-span-12 md:col-span-9 lg:col-span-10
              bg-[#808080]/10 backdrop-blur-md border-[1.5px] border-white/20 
              shadow-xl shadow-[#808080]/70 shrink-0 p-4 m-4 rounded-lg
              touch-pan-y overscroll-contain"
            >
              {priceData &&
                <section aria-labelledby="Main-Data-Title"
                  className="pb-4 text-left font-semibold"
                >
                  {selectedCoin ? (
                    <>
                      <div className="relative">
                        <div className={`flex items-center justify-between text-base md:text-lg md:border-b md:mb-4 pb-2
                              ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80 border-mist-200/20' : 'text-slate-700/80 border-mist-900/20'}`}>
                          <div id="Main-Data-Title"
                            className="flex justify-center md:justify-start uppercase"
                          >
                            <TrendingUpDown className="w-6 h-6 text-emerald-500 mr-2" strokeWidth={2.75} />
                            <h2><div className="hidden md:inline-block"> Aegis Crypto - </div> {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()}) <div className="hidden md:inline-block">Databoard</div> </h2>
                          </div>
                          <div className={` ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80' : 'text-slate-700/80'}`}>
                            <button popoverTarget="my-popover" 
                              className="flex items-center justify-center bg-teal-500 font-bold tracking-wider text-neutral-100
                                px-4 py-2 rounded-md shadow-md/30 hover:bg-teal-500/80 hover:shadow-none
                                hover:translate-y-0.5 focus:translate-y-0.5 focus:shadow-none
                                uppercase"
                            >
                              <div className="hidden md:inline-block text-sm lg:text-base">Top 11 Crypto Coin</div>
                              <div className="inline-block md:hidden"><LayoutDashboard className="w-5 h-5 text-white items-center"/></div>
                            </button>
                            <div id="my-popover" popover="auto" className="bg-transparent top-25 -left-75 scale-50 md:scale-75 lg:scale-100 md:-left-27 lg:left-1/5 touch-auto">
                                <CryptoTable coins={coins} historyData={sparkLineData} trends={trends} limit={11}/>
                            </div>
                          </div>

                        </div>

                        <section aria-label="Crypto Data" className="bg-neutral-700/20 p-3.5 md:p-5 rounded-lg shadow-lg shadow-neutral-500/50">
                          <div className={` border-b-2 pb-5 mb-5 flex justify-between items-end ${themeConfig[currentIndex].label === 'Night' ? 'border-neutral-200/70' : ' border-neutral-600/70'}`}>
                            <div className="">
                              <h3 className="flex items-center gap-1 text-lg md:text-3xl font-black text-white uppercase tracking-tight md:tracking-tighter">
                                <img 
                                  src={selectedCoin.image} 
                                  className="h-6 md:h-8 w-6 md:w-8 object-contain"
                                  alt={selectedCoin.name}
                                /> 
                                {selectedCoin.name}
                              </h3>
                              <p className="text-[12px] md:text-base font-black uppercase tracking-wide text-teal-300 ">{selectedCoin.id} // {selectedCoin.symbol.toUpperCase()}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg md:text-3xl font-black text-white">£{`${selectedCoin.current_price <= 3 ? selectedCoin.current_price : selectedCoin.current_price.toLocaleString()}`}</div>
                              <div className="text-[12px] md:text-base font-black text-teal-300 uppercase tracking-wide">Current Price</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-5 mb-5 touch-auto">
                            <CryptoField label="24h Change" value={`${(selectedCoin.price_change_percentage_24h ?? 0).toFixed(2)}%`} subMetric={+((selectedCoin.price_change_24h ?? 0).toFixed(5))} currentIndex={currentIndex} />
                            <CryptoField label="24h High" value={`£${selectedCoin.high_24h}`} currentIndex={currentIndex} />
                            <CryptoField label="24h Low" value={`£${selectedCoin.low_24h}`} currentIndex={currentIndex} />
                            <CryptoField label="Total Volume" value={`${(selectedCoin.total_volume / 1e9).toFixed(2)}B`} currentIndex={currentIndex} />
                            <CryptoField label="Market Cap" value={`£${(selectedCoin.market_cap / 1e9).toFixed(2)}B`} currentIndex={currentIndex} />
                            <CryptoField label="Market Rank" value={`${selectedCoin.market_cap_rank}`} currentIndex={currentIndex} />
                            <CryptoField label="Circulating" value={`${(selectedCoin.circulating_supply / 1e6).toFixed(2)}M ${selectedCoin.symbol.toUpperCase()}`} currentIndex={currentIndex} />
                            <CryptoField label="Max Supply" value={selectedCoin.max_supply ? `${(selectedCoin.max_supply / 1e6).toFixed(3)}M ${selectedCoin.symbol.toUpperCase()}` : `∞`} currentIndex={currentIndex} />
                          </div>
                        </section>
                        
                        <section 
                          role="group"
                          aria-label="Select Crypto Chart Time Range"
                          className="flex my-5 mx-auto justify-center"
                        >
                          {[7, 30, 90].map((day) => (
                            <button
                              key={day}
                              aria-pressed={params.days === day}
                              aria-label={`${day} days`}
                              className={`px-5 md:px-7 py-1 md:py-1.5 mx-auto md:mx-0 rounded-full border text-xs ${
                                params.days === day
                                  ? 'bg-neutral-800 text-white'
                                  : 'bg-white/50 text-neutral-600 hover:bg-neutral-200'
                              }`}
                              onClick={() => setParams((prev) => ({ ...prev, days: day })) }
                            >
                              <span className="md:hidden">{day} days</span>
                              <span className="sr-only">{day} days</span>
                            </button>
                          ))}
                        </section>
                      
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

                        <section aria-label="Crypto Data Two" className="bg-neutral-700/20 p-3.5 md:p-5 mt-5 rounded-lg shadow-lg shadow-neutral-500/50">
                          <div className={`lg:hidden border-b-2 pb-2 md:pb-5 mb-3 md:mb-5 flex justify-between items-end ${themeConfig[currentIndex].label === 'Night' ? 'border-neutral-200/70' : ' border-neutral-600/70'}`}>
                            
                            <label 
                              htmlFor="crypto-toggle" 
                              className="cursor-pointer"
                              role="button"
                              aria-label="Toggle for more Crypto Info"
                            >
                              <div className="">
                                <h3 className="flex items-center gap-1 text-xl md:text-3xl font-black text-white uppercase tracking-wide md:tracking-tighter">
                                  <img 
                                    src={selectedCoin.image} 
                                    className="h-5 md:h-8 w-5 md:w-8 object-contain"
                                    alt={selectedCoin.name}
                                  /> 
                                  {selectedCoin.name}
                                </h3>
                                <p className="hidden md:block text-[12px] md:text-base font-black uppercase tracking-wide text-teal-400 ">{selectedCoin.id} // {selectedCoin.symbol.toUpperCase()}</p>
                              </div>
                            </label>
                            <div className="text-right">
                              <div className="text-xl md:text-3xl font-black text-white">£{`${selectedCoin.current_price <= 3 ? selectedCoin.current_price : selectedCoin.current_price.toLocaleString()}`}</div>
                              <div className="hidden md:block text-[12px] md:text-base font-black text-teal-400 uppercase tracking-wide">Current Price</div>
                            </div>
                            
                          </div>
                          
                          <input 
                              type="checkbox" 
                              id="crypto-toggle" 
                              className="peer hidden"
                              checked={isDataExpanded}
                              aria-controls="Further-Crypto-Info"
                              onChange={() => setIsDataExpanded(!isDataExpanded)}
                              aria-expanded={isDataExpanded}
                            />
                          <div
                            id="Further-Crypto-Info"
                            className="hidden peer-checked:grid lg:grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-5 mb-5 lg:mt-5"
                          >
                            <CryptoField label="Market Cap Change 24h" value={`${((selectedCoin.market_cap_change_24h ?? 0) / 1e9).toFixed(4)}B`} currentIndex={currentIndex} />
                            <CryptoField label="Market Cap Change 24h %" value={`${(selectedCoin.market_cap_change_percentage_24h ?? 0).toFixed(2) ?? 0}%`} currentIndex={currentIndex} />
                            <CryptoField label="Total Supply" value={`${(selectedCoin.total_supply / 1e6).toFixed(3) ?? 'N/A'}M ${selectedCoin.symbol.toUpperCase()}`} currentIndex={currentIndex} />
                            <CryptoField label="Max Supply" value={selectedCoin.max_supply ? `${(selectedCoin.max_supply / 1e6).toFixed(2)}M ${selectedCoin.symbol.toUpperCase()}` : '∞'} currentIndex={currentIndex} />
                            <CryptoField label="All Time High" value={`£${(selectedCoin.ath).toFixed(2)}`} currentIndex={currentIndex} />
                            <CryptoField label="All Time High % Change" value={`${selectedCoin.ath_change_percentage?.toFixed(2) ?? '0'}%`} currentIndex={currentIndex} />
                            <CryptoField label="All Time Low" value={`£${(selectedCoin.atl).toFixed(2)}`} currentIndex={currentIndex} />
                            <CryptoField label="All Time Low % Change" value={`${selectedCoin.atl_change_percentage.toFixed(2) ?? '0'}%`} currentIndex={currentIndex} />
                          </div>
                        </section>

                        
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="flex justify-center pb-4 mb-4 text-base md:text-lg text-slate-700/80 uppercase">Select a Cryptocurrency from sidebar to view data</h3>
                    </>
                  )}
                </section>

              }
            </main>
            
            <section className="relative inset-0 z-40
              transform transition-transform duration-300
              md:static col-span-full md:translate-x-0
            bg-[#808080]/10 backdrop-blur-md border-[1.5px] border-white/20 shadow-xl 
              shadow-[#808080]/70 shrink-0 p-2 md:p-4 m-4 rounded-lg
              overflow-y-auto touch-pan-y"
            >
              <div className={`relative pb-4 mb-2 border-b uppercase text-center font-semibold
                ${themeConfig[currentIndex].label === 'Night' ? 'border-mist-200/20' : 'border-mist-900/20'}`}
              >
                <div className="flex justify-center">
                  <TrendingUp className="w-8 h-8 text-emerald-400 mr-2"/>
                  <h2 
                    id="Crypto-Menu-Title"
                    className={`text-base md:text-lg
                      ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80 ' : 'text-slate-700/80'}
                    `}
                  >
                    Top Crypto Coins by rank
                  </h2>

                </div>
              </div>
              <CryptoTable 
                coins={coins} 
                historyData={sparkLineData}
                trends={trends}
                limit={15}
              />
            </section>

          </div>

          <section className={`relative inset-0 z-40 transform transition-transform
            duration-300 md:static col-span-full md:translate-x-0 bg-[#808080]/10
            backdrop-blur-md border-[1.5px] border-white/20 shadow-xl shadow-[#808080]/70
            shrink-0 p-2 md:p-4 m-4 rounded-lg overflow-y-auto touch-pan-y
            ${themeConfig[currentIndex].label === 'Night' 
              || themeConfig[currentIndex].label === 'Autumn' 
              ? 'text-slate-200/80 ' : 'text-slate-900/80'}
            `}
          >
            <details className="bg-neutral-700/20 p-3.5 md:p-5 m-4 rounded-lg shadow-lg shadow-neutral-500/50">
              {description && (
                <>
                  <summary className="cursor-pointer">About {getFirstWord(description)}</summary>
                  <div
                    className="prose prose-invert py-4"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                
                </>
              )}
            </details>
          </section>

          <section aria-label="Theme selection"
            className={`flex backdrop-blur-md border border-white/10
            rounded-md p-1 shadow-[0_4px_30px_rgba(0,0,0,0.1)] justify-between
            ${themeConfig[currentIndex].label === 'Default' ? 'bg-neutral-400/50' : 'bg-white/5'}`}
          >
            {themeConfig.map((theme, idx) => (
              <button
                key={theme.label}
                role="tab"
                aria-pressed={currentIndex === idx ? true : false}
                onClick={() => setCurrentIndex(idx)}
                className={`px-2 py-1 text-[10px] md:text-[12px] lg:text-[14px] font-mono font-bold rounded-sm uppercase tracking-widest transition-all duration-300 hover:bg-white/10
                  ${currentIndex === idx 
                    ? 'bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                    : 'text-white/70 hover:text-white hover:bg-white/30'
                  }`}
              >
                {theme.label}
              </button>
            ))}
          </section>
        </div>
      </div>
      
    </>
  );
}

export default App;