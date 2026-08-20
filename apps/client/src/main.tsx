import React from 'react';

import { createRoot } from 'react-dom/client';

import './bootstrap.js';

import App from './App.js';

const rootElement = document.getElementById('app');
if (!rootElement) {
  throw new Error('Missing root element');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
