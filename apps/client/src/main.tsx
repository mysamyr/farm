import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createRoot } from 'react-dom/client';

import App from './App';
import { getTheme } from './utils/theme';

const queryClient = new QueryClient();

const rootElement = document.getElementById('app');
if (!rootElement) {
  throw new Error('Missing root element');
}

// Set initial theme
document.documentElement.setAttribute('data-theme', getTheme());

createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
