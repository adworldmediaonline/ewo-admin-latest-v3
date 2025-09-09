'use client';
import React from 'react';
import { ToastContainer } from 'react-toastify';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children} <ToastContainer />
    </>
  );
};

export default Wrapper;
