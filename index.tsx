import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Register Service Worker for PWA
// Hanya register jika bukan environment preview/development tertentu untuk menghindari error console
const isPreview = window.location.hostname.includes('webcontainer') || 
                  window.location.hostname.includes('ai.studio') ||
                  window.location.hostname.includes('googleusercontent');

if ('serviceWorker' in navigator && !isPreview) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js') 
      .then((registration) => {
        console.log('Service Worker Registered');
      })
      .catch((err) => {
        // Silently catch error in non-prod environments
        console.warn('SW registration failed (this is normal in preview):', err.message);
      });
  });
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}