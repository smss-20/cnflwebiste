
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';
import { supabaseError } from './supabase/client';
import ConfigurationError from './components/ConfigurationError';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

if (supabaseError) {
  // If there's a configuration error, render only the error screen.
  // This prevents the providers from trying to initialize with a null client.
  root.render(
    <React.StrictMode>
      <ConfigurationError title={supabaseError.title} description={supabaseError.description} />
    </React.StrictMode>
  );
} else {
  // Otherwise, render the full application.
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}