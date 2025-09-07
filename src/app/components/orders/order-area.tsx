'use client';
import React from 'react';
import OrderTable from './order-table';

const OrderArea = () => {
  return (
    <div className="space-y-4">
      {/* order table start */}
      <OrderTable />
      {/* order table end */}
    </div>
  );
};

export default OrderArea;
