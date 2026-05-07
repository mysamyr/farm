import React from 'react';

import { createRoot } from 'react-dom/client';

import App from './App';
import { getTheme } from './utils/theme';

const rootElement = document.getElementById('app');
if (!rootElement) {
  throw new Error('Missing root element');
}

// Set initial theme
document.documentElement.setAttribute('data-theme', getTheme());

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
