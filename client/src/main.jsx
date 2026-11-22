import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './app/App';
import './index.scss';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#000000',
          color: '#FFFFFF',
          fontSize: '14px',
          borderRadius: '8px',
        },
      }}
    />
    <App />
  </StrictMode>
);
