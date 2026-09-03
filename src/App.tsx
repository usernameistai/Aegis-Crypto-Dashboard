import { useEffect, useMemo, useRef, useState, type FC } from "react";
import { themeConfig, preload_images } from "./config/themeConfig";
import { useCoins, usePriceData, useTrends } from "./lib/cyrptoApi";
import type { 
  CryptoDataProps, 
  CryptoTrendsProps, 
  CryptoDataHistory, 
  CryptoDataPoint,
  CryptoDescriptionProps 
} from "./types/cryptoDataTypes";
import CryptoChart from "./components/CryptoChart";
import CryptoField from "./components/CryptoField";
import CryptoSearch from "./components/CryptoSearch";
import TrendSparkLine from "./components/TrendSparkLine";
import CryptoTable from "./components/CryptoTable";
import { LuSquareMenu } from "react-icons/lu";
import { BookHeart, Star } from "lucide-react";
import { 
  BookOpenText, 
  ChartCandlestickIcon, 
  FlameIcon, 
  LayoutDashboardIcon, 
  TrendingUpDownIcon, 
  TrendingUpIcon 
} from "@animateicons/react/lucide";
import { Flip, ToastContainer, toast } from 'react-toastify';
import axios from "axios";

const App: FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedCoin, setSelectedCoin] = useState<CryptoDataProps | null>(null);
  const [params, setParams] = useState<CryptoDataHistory>({ id: `bitcoin`, currency: 'gbp', days: 90 });
  const [descriptionCache, setDescriptionCache] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isDataExpanded, setIsDataExpanded] = useState(false);
  const [favourite, setFavourite] = useState<string[]>(() => JSON.parse(localStorage.getItem("favourites") ?? "[]"));
  const { data: trends = [], isLoading: isTrendsLoading, error: isTrendsError } = useTrends();
  const { data: coins = [], isLoading: isCoinsLoading, error: isCoinsError } = useCoins();
  const { data: priceData, isLoading: isPriceDataLoading, error: isPriceDataError } = usePriceData(params.id, params.currency, params.days)
  const menuRef = useRef<HTMLInputElement>(null);

  const BASE = 'https://api.coingecko.com/api/v3';
  const descripionUrl = useMemo(() => `${BASE}/coins/${params.id}?tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`, [params.id]);
 
  {/* Preload Images for smoothness */}
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    let loadedCount = 0;
    let timeoutId: number | undefined = undefined;

    const handleImageLoad = () => {
      loadedCount++;
      if (loadedCount === preload_images.length) {
        setIsLoading(false);
        
        timeoutId = window.setTimeout(() => {
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'instant' : 'smooth',
          });
        }, 0);
      }
    };

    preload_images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = handleImageLoad;
      img.onerror = handleImageLoad;
    });

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId ?? 0);
      }
    };
  }, []);
  {/* Theme image class selector */}
  useEffect(() => {
    document.body.className = themeConfig[currentIndex].className;
  }, [currentIndex]);
  {/* useEffects for Errors */}
  useEffect(() => {
    if ( isCoinsError || isTrendsError || isPriceDataError ) {
      toast.error("Something has gone wrong, please ctrl + shift + 'i' for developer console");
    }
  }, [isCoinsError, isTrendsError, isPriceDataError]);

  const createSparkLineData = ( coins: CryptoDataProps[] ): Record<string, CryptoDataPoint[]> => {
    const result: Record<string, CryptoDataPoint[]> = {};

    const usdToGBP = 0.7453;

    coins.forEach((coin) => {
      const prices = coin.sparkline_in_7d?.price;
      if (!prices?.length) return;

      const interval = (7 * 24 * 3600 * 1000) / (prices.length - 1);

      result[coin.id] = prices.map((price, i) => ({
        date: new Date(
          Date.now() - (prices.length - 1 - i) * interval
        ).toISOString(),
        price: price * usdToGBP,
      }));
    });

    return result;
  };
  const sparkLineData = useMemo(
    () => createSparkLineData(coins),
    [coins]
  );

  const formattedData = useMemo(() => {
    if (!priceData?.prices) return [];
  
    return priceData.prices.map(([timestamp, price]) => ({ // : [number, number]
        date: new Date(timestamp).toISOString(),
        price: price,
      }));
  }, [priceData]);

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

    if (menuRef.current) menuRef.current.checked = false;
    
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleFavourites = (coin: CryptoDataProps) => {
    if (favourite.includes(coin.id)) {
      const newFavourites = favourite.filter((c) => c !== coin.id);

      localStorage.setItem("favourites", JSON.stringify(newFavourites));

      setFavourite(newFavourites);
    } else  {

      const favourites = JSON.parse(localStorage.getItem("favourites") ?? "[]");

      const newFavourites = [
        ...favourites,
        coin.id
      ];

      const jsonNewFavs = JSON.stringify(newFavourites);

      localStorage.setItem("favourites", jsonNewFavs);
      
      setFavourite(newFavourites);
    };
  };

  const fetchDescriptionData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get<CryptoDescriptionProps>(descripionUrl, { 
        headers: { 'x-cg-demo-api-key': import.meta.env.VITE_COINGECKO_API_KEY }
      });
      setDescriptionCache((prev) => ({
        ...prev,
        [params.id]: res.data.description?.en ?? ''
      }));
    } catch (err) {
      if (!axios.isCancel(err)) console.error("Coin description fetch error", err);
    } finally {
      setIsLoading(false);
    }
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
          
          {( isLoading || isCoinsLoading || isTrendsLoading || isPriceDataLoading ) && (
            <>
              <div role="status" aria-live="polite" aria-label="Loading Crypto Data"
                className="fixed inset-0 w-screen h-screen bg-neutral-900/80 
                flex flex-col items-center justify-center z-200 text-white">
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

          {search && (
            <div className="sr-only">
              Where do Generals keep their armies?
              In their sleevies!!
            </div>
          )}

          {themeConfig.map((_, idx) => (
            <div
              key={idx}
              className={`theme-layer bg-layer-${idx} ${currentIndex === idx ? 'theme-active' : ''}`}
            />
          ))}

          {/* Theme Selector */}
          <section aria-label="Theme selection"
            className={`flex backdrop-blur-lg border border-white/10
            rounded-b-md p-1 shadow-[0_4px_30px_rgba(0,0,0,0.1)] justify-between
            ${themeConfig[currentIndex].label === 'Default' ? 'bg-neutral-400/30' : 'bg-white/5'}`}
          >
            {themeConfig.map((theme, idx) => (
              <button
                key={theme.label}
                role="tab"
                aria-pressed={currentIndex === idx ? true : false}
                onClick={() => setCurrentIndex(idx)}
                className={`px-2 py-1 text-[9px] md:text-[10px] lg:text-[13px] font-semibold rounded-sm uppercase tracking-widest transition-all duration-300 hover:bg-white/10 hover:font-bold
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
          
          {/* Main Title */}
          <h1 className={`top-0 mt-3 mb-10 md:my-3 text-center text-[#808080]
            text-xl md:text-4xl uppercase font-black tracking-[0.225em]
            ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80' : 'text-[#808080]'}`}
          >
            Aegis Crypto Dashboard
          </h1>

          {/* Trending Crypto Coins */}
          <section aria-label="Trending Crypto List Horizontal"
            className={`flex bg-[#808080]/10 backdrop-blur-lg border-[1.5px] border-white/20 shadow-xl 
            shadow-[#808080]/60 p-2 md:p-4 m-4 rounded-lg
            ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80 ' : 'text-slate-700/80'}`}
          >
            <div className="flex w-full flex-col items-center">
              <div className={`flex justify-between w-full items-center border-b md:-mt-1.5 mb-2 pb-2
                ${themeConfig[currentIndex].label === 'Night' ? 'border-mist-200/20' : 'border-mist-900/20'}
              `}>
                <div className="flex min-w-0 flex-1 items-center">
                  <FlameIcon className="text-orange-500" size={24} />
                  <h2 className="text-base md:text-lg uppercase font-semibold">
                    Trending Aegis Crypto
                  </h2>
                </div>
                <div className={`flex shrink-0 ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80' : 'text-slate-700/80'}`}>
                  <button popoverTarget="favourite-popover" 
                    className="flex shrink-0 items-center justify-center bg-teal-500 font-bold tracking-wider text-neutral-100 leading-5
                      px-3 py-1.5 md:px-4 md:py-2 rounded-md shadow-md/30 hover:bg-teal-500/80 hover:shadow-none
                      hover:translate-y-0.5 focus:translate-y-0.5 focus:shadow-none
                      uppercase"
                  >
                    <div className="flex justify-between text-sm lg:text-base">
                      <span className="hidden md:inline-flex mr-1">Favourite</span>
                      <BookHeart className="w-5 h-5 text-white"/>
                    </div>
                  </button>
                  <div id="favourite-popover" popover="auto" className="bg-transparent top-25 lg:top-20 -left-52 md:-left-44 lg:left-36 scale-55 md:scale-70 lg:scale-85 touch-auto">
                    <CryptoTable 
                      coins={coins.filter(coin => favourite.includes(coin.id))} 
                      historyData={sparkLineData}
                      trends={trends}
                      limit={favourite.length}
                      className="text-base md:text-xl"
                    />
                  </div>
                </div>
              </div>
              <div className="flex w-full items-center gap-1">
                {trends.slice(0, 8).map((trend, index) => (
                  <button key={trend.id} 
                    className={`flex flex-1 items-center justify-between border-2 border-white/10 bg-[#808080]/10 px-2 py-1 
                      rounded-lg shadow-md hover:shadow-lg hover:border-cyan-300 gap-1 cursor-pointer min-h-10 md:min-h-15 lg:min-h-17
                      hover:scale-105
                      ${ index <= 1 
                          ? "flex"
                          : index <= 4 
                            ? "hidden md:flex"
                            : "hidden lg:flex"
                      }
                      ${themeConfig[currentIndex].label === 'Night' ? 'hover:bg-white/20' : 'hover:bg-white/50'}
                    `}
                    onClick={() => handleCryptoTrend(trend)}
                  >
                    <img 
                      src={trend.small} 
                      alt={trend.name} 
                      className="w-5 h-5 md:w-8 md:h-8 lg:w-10 lg:h-10 my-auto"
                    />
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-[11px] md:text-xs lg:text-sm hidden md:flex">{trend.name}</span>
                      <span className="text-[10px] md:text-[11px] lg:text-xs">{trend.symbol}</span>
                    </div>
                    <TrendSparkLine 
                      src={trend.data.sparkline} 
                      className="pl-2"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Aside and Main */}
          <section className="relative grid grid-cols-12">
            <input 
              type="checkbox" 
              id="menu-toggle" 
              className="peer hidden"
              ref={menuRef}
            />
            <label 
              htmlFor="menu-toggle" 
              className={`touch-manipulation md:hidden p-2 fixed top-17 left-4 z-50 
                bg-neutral900/50 backdrop-blur-sm border border-white/10
                rounded-lg cursor-pointer flex items-center gap-2
                ${themeConfig[currentIndex].label === 'Night' || themeConfig[currentIndex].label === 'Summer' || themeConfig[currentIndex].label === 'Spring' || themeConfig[currentIndex].label === 'Autumn' || themeConfig[currentIndex].label === 'Winter'
                  ? 'text-teal-400 ' : 'text-teal-500'}
                `}
              role="button"
              aria-label="Toggle Crypto Sidebar Menu"
              aria-expanded={isOpen}
              onClick={() => setIsOpen(!isOpen)}
              aria-controls="Crypto-Sidebar"
            >
              <div><LuSquareMenu size={24}/></div> 
              <div className="ml-1 font-mono font-semibold uppercase tracking-wider">Crypto Sidebar</div>
            </label>
            
            {/* Sidebar & Crypto Search */}
            <aside 
              className="min-h-dvh fixed md:static z-100 top-25 right-0 bottom-0 left-0 md:top-0 transform 
                transition-transform duration-300 translate-x-full peer-checked:translate-x-0 
                md:col-span-3 lg:col-span-2 md:translate-x-0 peer-checked:left-0
              bg-[#808080]/10 backdrop-blur-lg border-[1.5px] border-white/20 shadow-xl 
                shadow-[#808080]/70 p-2 md:p-4 m-4 rounded-lg
                overflow-y-auto touch-pan-y overscroll-contain"
              id="Crypto-Sidebar"
              aria-labelledby="Crypto-Menu-Title"
            >

              <div aria-label="Crypto list select title"
                className={`relative pb-4 mb-2 border-b uppercase text-left font-semibold flex items-center
                  ${themeConfig[currentIndex].label === 'Night' ? 'border-mist-200/20' : 'border-mist-900/20'}`}
              >
                <div className="flex items-center">
                  <ChartCandlestickIcon 
                    className={` mr-1 ${themeConfig[currentIndex].label === 'Night' || themeConfig[currentIndex].label === 'Summer' || themeConfig[currentIndex].label === 'Spring' 
                      ? 'text-teal-400 ' : 'text-teal-500'}`} 
                    size={24}
                  />
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

              <CryptoSearch coins={coins} handleSelectCoin={handleSelectCoin}/>
              
              { coins && 
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
                          onClick={() => handleSelectCoin(c)}
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
              bg-[#808080]/10 backdrop-blur-lg border-[1.5px] border-white/20 
              shadow-xl shadow-[#808080]/70 shrink-0 p-2 md:p-4 m-4 rounded-lg
              touch-pan-y overscroll-contain"
            >
              {priceData &&
                <section aria-labelledby="Main-Data-Title"
                  className="pb-4 mb-2 text-left font-semibold"
                >
                  {selectedCoin ? (
                    <>
                      <div className="relative">

                        <div className={`flex items-center justify-between text-base md:text-lg md:border-b md:mb-4 md:-mt-1 pb-3
                          ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80 border-mist-200/20' : 'text-slate-700/80 border-mist-900/20'}`}
                        >
                          <div id="Main-Data-Title" aria-label="Main-Data-Title"
                            className="flex items-center justify-center md:justify-start uppercase"
                          >
                            <TrendingUpDownIcon 
                              className={` mr-2 
                                ${themeConfig[currentIndex].label === 'Night' || themeConfig[currentIndex].label === 'Summer' || themeConfig[currentIndex].label === 'Spring' 
                                 ? 'text-teal-400 ' : 'text-teal-500'}`}  
                                 size={30} 
                            />
                            <h2><div className="hidden md:inline-block"> Aegis Crypto - </div> {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()}) <div className="hidden md:inline-block">Databoard</div> </h2>
                          </div>
                          <div className={` ${themeConfig[currentIndex].label === 'Night' ? 'text-slate-200/80' : 'text-slate-700/80'}`}>
                            <button popoverTarget="my-popover" 
                              className="flex shrink-0 items-center justify-center bg-teal-500 font-bold tracking-wider text-neutral-100
                                px-3 py-1.5 md:px-4 md:py-2 rounded-md shadow-md/30 hover:bg-teal-500/80 hover:shadow-none
                                hover:translate-y-0.5 focus:translate-y-0.5 focus:shadow-none
                                uppercase"
                            >
                              <div className="flex justify-between text-white items-center text-sm lg:text-base">
                                <div className="hidden md:inline-block mr-1">Top 11 Crypto</div>
                                <LayoutDashboardIcon className="w-5 h-5"/>
                              </div>
                            </button>
                            <div id="my-popover" popover="auto" className="bg-transparent top-25 lg:top-10 -left-67 md:-left-55 lg:left-36 scale-40 md:scale-70 lg:scale-85 touch-auto">
                              <CryptoTable 
                                coins={coins} 
                                historyData={sparkLineData} 
                                trends={trends} 
                                limit={11}
                                className="text-lg md:text-xl"
                              />
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
                                <Star
                                  onClick={() => handleFavourites(selectedCoin)}
                                  className={`ml-1 ${favourite.includes(selectedCoin.id) 
                                    ? "text-yellow-200 fill-[#FFD700] drop-shadow-[0_0_5px_#FFD700]" 
                                    : "text-neutral-300 fill-indigo-800/50" }`}
                                />
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
            
            {/* Crypto Table*/}
            <section className="relative inset-0 z-40
              transform transition-transform duration-300
              md:static col-span-full md:translate-x-0
            bg-[#808080]/10 backdrop-blur-lg border-[1.5px] border-white/20 shadow-xl 
              shadow-[#808080]/70 shrink-0 p-2 md:p-4 m-4 rounded-lg
              overflow-y-auto touch-pan-y"
            >
              <div className={`relative pb-4 mb-2 border-b uppercase text-center font-semibold
                ${themeConfig[currentIndex].label === 'Night' ? 'border-mist-200/20' : 'border-mist-900/20'}`}
              >
                <div className="flex justify-center">
                  <TrendingUpIcon className="text-teal-400 mr-2" size={35} />
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
                className="text-sm md:text-base tracking-wide md:tracking-normal"
              />
            </section>

          </section>
                    
          {/* Details */}
          <section aria-label="Detailed description of the selected crypto coin"
            className={`relative inset-0 z-40 transform transition-transform
            duration-300 md:static col-span-full md:translate-x-0 bg-[#808080]/10
            backdrop-blur-lg border-[1.5px] border-white/20 shadow-xl shadow-[#808080]/70
            shrink-0 p-2 md:p-4 m-4 rounded-lg overflow-y-auto touch-pan-y
            ${themeConfig[currentIndex].label === 'Night' 
              || themeConfig[currentIndex].label === 'Autumn' 
              ? 'text-slate-200/80 ' : 'text-slate-900/80'}
            `}
          >
            <details 
              className="bg-neutral-700/20 p-3.5 md:p-5 m-4 rounded-lg shadow-lg shadow-neutral-500/50 tracking-wide cursor-pointer"
              onToggle={(e) => {
                if (e.currentTarget.open && !descriptionCache[params.id]) fetchDescriptionData();
              }}
            >
              {descriptionCache[params.id] && (
                <>
                  <summary className="cursor-pointer flex items-start gap-2 text-[17px] md:text-lg font-semibold">
                    <BookOpenText className="text-teal-400" size={24} /><span>About {getFirstWord(descriptionCache[params.id])}</span>
                  </summary>
                  <div
                    className="prose prose-invert py-4 font-medium text-[15px] md:text-base"
                    dangerouslySetInnerHTML={{ __html: descriptionCache[params.id] }}
                  />
                
                </>
              )}
            </details>
          </section>

          {/* Theme Selector */}
          <section aria-label="Theme selection"
            className={`flex backdrop-blur-lg border border-white/10
            rounded-t-md p-1 shadow-[0_4px_30px_rgba(0,0,0,0.1)] justify-between
            ${themeConfig[currentIndex].label === 'Default' ? 'bg-neutral-400/50' : 'bg-white/5'}`}
          >
            {themeConfig.map((theme, idx) => (
              <button
                key={theme.label}
                role="tab"
                aria-pressed={currentIndex === idx ? true : false}
                onClick={() => setCurrentIndex(idx)}
                className={`px-2 py-1 text-[9px] md:text-[10px] lg:text-[13px] font-mono font-bold rounded-sm uppercase tracking-widest transition-all duration-300 hover:bg-white/10
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