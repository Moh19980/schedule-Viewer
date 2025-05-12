import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

// Use a function to encapsulate rendering logic
const renderApp = () => {
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found');
    return;
  }

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
};

renderApp();
