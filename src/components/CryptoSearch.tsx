import React, { useMemo, useRef, useState, type FC } from 'react';
import type { CryptoDataProps } from '@/types/cryptoDataTypes';

interface CryptoSearchProps {
  coins: CryptoDataProps[];
  handleSelectCoin: (coin: CryptoDataProps) => void;
}

const CryptoSearch:FC<CryptoSearchProps> = ({ coins, handleSelectCoin }) => {
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredCoins = useMemo(() => {
    if (!search) return [];

    return coins.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, coins]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.relatedTarget && e.currentTarget.form?.contains(e.relatedTarget)) {
      return;
    };

    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    };
    
    blurTimeoutRef.current = setTimeout(() => {
      setSearch('');
    }, 200);
  };

  return (
    <>
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
                  setSearch('');
                }}
              >
                {coin.name}
              </button>
            ))}
          </div>
        )}
      </form>
    </>
  )
}

export default CryptoSearch;