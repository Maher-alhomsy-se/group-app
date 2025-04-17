import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// import { WagmiProvider } from 'wagmi';
import { ToastContainer } from 'react-toastify';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './index.css';
import App from './App.tsx';
// import { config } from './util/config.ts';

// const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <WagmiProvider config={config}> */}
    {/* <QueryClientProvider client={queryClient}> */}
    <App />
    {/* </QueryClientProvider> */}
    {/* </WagmiProvider> */}
    <ToastContainer position="top-right" />
  </StrictMode>
);
