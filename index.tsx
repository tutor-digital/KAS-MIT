import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Register Service Worker for PWA
// KITA HARUS MENCOBA REGISTER SW AGAR FITUR INSTALL MUNCUL
// Walaupun di preview mungkin gagal/warning, browser butuh 'intent' untuk register.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js') 
      .then((registration) => {
        console.log('Service Worker Registered with scope:', registration.scope);
      })
      .catch((err) => {
        // Log warning saja, jangan crash.
        // Di environment preview iframe, ini mungkin gagal karena security origin, 
        // tapi di Production/Vercel/Netlify ini akan berhasil.
        console.warn('SW registration skipped (expected in some previews):', err.message);
      });
  });
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}