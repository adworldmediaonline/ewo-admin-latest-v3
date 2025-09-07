'use client';
import AuthCom from '@/app/components/auth/auth-com';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { store } from './store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Provider store={store}>
        <AuthCom>{children}</AuthCom>
        <ToastContainer />
      </Provider>
    </>
  );
}
