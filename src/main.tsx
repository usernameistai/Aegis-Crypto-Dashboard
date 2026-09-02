import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast } from 'react-toastify';
import App from './App.tsx';
import "react-toastify/dist/ReactToastify.css";
import './index.css';

const queryClient = new QueryClient({
  // 👇 The Global Fallback Safety Net
  queryCache: new QueryCache({
    onError: (error, query) => {
      // 1. Skip showing a global toast if the query already has a custom toast handler
      // This stops useTrends (Shirley toast) from throwing a double error message!
      if (query.queryKey[0] === 'trends') return;
      // 2. Check if the error is a CoinGecko rate limit (HTTP 429)
      if (error.message.includes('429')) {
        toast.error("🚀 CoinGecko Rate Limit reached! Please wait 60 seconds.");
        return;
      }
      // 3. Fallback generic message for any other network failure
      toast.error(`⚠️ Network Error: ${error.message || 'Something went wrong'}`);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
    }
  }
}); // new object to manage queries

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
