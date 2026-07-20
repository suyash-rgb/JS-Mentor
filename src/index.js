import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ClerkProvider } from '@clerk/clerk-react';

// Suppress benign ResizeObserver & Script error warnings globally across the app (e.g. when opening DevTools or resizing Monaco Editor)
if (typeof window !== 'undefined') {
  const errorHandler = (e) => {
    if (
      e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
      e.message === 'ResizeObserver loop limit exceeded' ||
      e.message === 'Script error.'
    ) {
      e.stopImmediatePropagation();
      if (typeof e.preventDefault === 'function') e.preventDefault();
    }
  };
  window.addEventListener('error', errorHandler);
  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason && typeof e.reason.message === 'string' && e.reason.message.includes('ResizeObserver')) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
    }
  });
}


const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
  <React.StrictMode>
   <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
 
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
