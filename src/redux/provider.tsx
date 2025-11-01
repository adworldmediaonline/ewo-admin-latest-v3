'use client';

import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from 'next-themes';
import { store } from './store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <Provider store={store}>
        {children}
        <ToastContainer />
      </Provider>
    </ThemeProvider>
  );
}
