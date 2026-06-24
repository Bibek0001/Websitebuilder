import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Keep Render backend awake — ping every 14 minutes to prevent 15min sleep
const API = process.env.REACT_APP_API_URL || '';
if (API && process.env.NODE_ENV === 'production') {
  setInterval(() => {
    fetch(`${API}/health`).catch(() => {});
  }, 14 * 60 * 1000); // every 14 minutes
}

reportWebVitals();
