import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HelmetProvider} from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Handle benign WebSocket HMR disconnect errors gracefully in sandboxed iframe runtime
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const reasonStr = typeof reason === 'string' ? reason : (reason?.message || reason?.stack || reason?.toString?.() || '');
  if (reasonStr.toLowerCase().includes('websocket') || reasonStr.toLowerCase().includes('ws')) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);

