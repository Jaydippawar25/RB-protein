import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

// Global prevention of mouse wheel and Up/Down arrow keys changing number input values
if (typeof window !== 'undefined') {
  window.addEventListener(
    'wheel',
    (e) => {
      if (document.activeElement && document.activeElement.type === 'number') {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  window.addEventListener('keydown', (e) => {
    if (
      document.activeElement &&
      document.activeElement.type === 'number' &&
      (e.key === 'ArrowUp' || e.key === 'ArrowDown')
    ) {
      e.preventDefault();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster position="top-center" toastOptions={{
            style: { background: '#1B1F1B', color: '#fff', border: '1px solid #2A2F2A' },
            success: { iconTheme: { primary: '#FF6B00', secondary: '#0A0B0A' } },
          }} />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
