import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';

// Get the publishable key from environment variables
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
  "pk_test_bmVhdC1rYXR5ZGlkLTc2LmNsZXJrLmFjY291bnRzLmRldiQ";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);