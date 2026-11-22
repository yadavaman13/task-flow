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
          background: '#FFFFFF',
          color: '#000000',
          border: '1px solid #000000',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          fontSize: '14px',
          fontWeight: 500,
          borderRadius: '8px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#000000',
            secondary: '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#000000',
            secondary: '#FFFFFF',
          },
        },
      }}
    />
    <App />
  </StrictMode>
);
