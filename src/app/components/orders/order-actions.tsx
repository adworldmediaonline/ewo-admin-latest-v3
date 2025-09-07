import Link from 'next/link';
import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useGetSingleOrderQuery } from '@/redux/order/orderApi';
import { Invoice, View } from '@/svg';
import { notifyError } from '@/utils/toast';
import InvoicePrint from './invoice-print';

const OrderActions = ({
  id,
  cls,
  inline = false,
}: {
  id: string;
  cls?: string;
  inline?: boolean;
}) => {
  const [showInvoice, setShowInvoice] = useState<boolean>(false);
  const [showView, setShowView] = useState<boolean>(false);
  const printRefTwo = useRef<HTMLDivElement | null>(null);
  const { data: orderData, isLoading, isError } = useGetSingleOrderQuery(id);

  const handlePrint = useReactToPrint({
    content: () => printRefTwo?.current,
    documentTitle: 'Receipt',
  });

  const handlePrintReceipt = async () => {
    try {
      handlePrint();
    } catch (err) {
      console.log('order by user id error', err);
      notifyError('Failed to print');
    }
  };

  const actionButtons = (
    <div className="flex items-center justify-end space-x-2">
      <div className="relative">
        <button
          onMouseEnter={() => setShowInvoice(true)}
          onMouseLeave={() => setShowInvoice(false)}
          onClick={handlePrintReceipt}
          className="w-auto px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Invoice />
        </button>
        <div
          className={`${
            showInvoice ? 'flex' : 'hidden'
          } flex-col items-center z-50 absolute left-1/2 -translate-x-1/2 bottom-full mb-1`}
        >
          <span className="relative z-10 p-2 text-xs leading-none font-medium text-white whitespace-no-wrap w-max bg-slate-800 rounded py-1 px-2 inline-block">
            Print
          </span>
          <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <>
        <div style={{ display: 'none' }}>
          {orderData && (
            <div ref={printRefTwo}>
              <InvoicePrint orderData={orderData} />
            </div>
          )}
        </div>
        {actionButtons}
      </>
    );
  }

  return (
    <>
      <td style={{ display: 'none' }}>
        {orderData && (
          <div ref={printRefTwo}>
            <InvoicePrint orderData={orderData} />
          </div>
        )}
      </td>

      <td className={`${cls ? cls : 'px-9 py-3 text-end'}`}>{actionButtons}</td>
    </>
  );
};

export default OrderActions;
