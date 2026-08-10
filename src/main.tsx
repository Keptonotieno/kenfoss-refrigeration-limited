import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HelmetProvider} from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerSW';

// Register PWA Service Worker for offline capability & home screen installation
registerServiceWorker();

// Handle benign WebSocket HMR disconnect errors gracefully in sandboxed iframe runtime
const isWebSocketError = (err: any) => {
  if (!err) return false;
  const str = typeof err === 'string' ? err : (err.message || err.stack || err.reason || String(err) || '');
  const lower = str.toLowerCase();
  if (lower.includes('websocket') || lower.includes('ws') || lower.includes('closed without opened')) {
    return true;
  }
  if (err instanceof Event && (err.type === 'error' || err.type === 'close')) {
    return true;
  }
  return false;
};

window.addEventListener('unhandledrejection', (event) => {
  if (isWebSocketError(event.reason) || isWebSocketError(event)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

window.addEventListener('error', (event) => {
  if (isWebSocketError(event.error) || isWebSocketError(event.message) || isWebSocketError(event)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);

