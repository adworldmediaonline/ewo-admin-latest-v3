'use client';
import React, { useState } from 'react';
import {
  useShipOrderMutation,
  useUpdateStatusMutation,
  useSendDeliveryNotificationMutation,
} from '@/redux/order/orderApi';
import { Order } from '@/types/order-amount-type';
import ShippingModal from './shipping-modal';

interface ShippingActionsProps {
  order: Order;
}

// Delivery Confirmation Modal Component
interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onDeliver: (orderId: string) => Promise<void>;
}

const DeliveryModal: React.FC<DeliveryModalProps> = ({
  isOpen,
  onClose,
  order,
  onDeliver,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await onDeliver(order._id);
      setSuccess(
        'Order marked as delivered successfully! Customer has been notified via email.'
      );

      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to mark order as delivered');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Mark as Delivered
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Confirm order delivery completion
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Order Details</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono font-medium">
                  #{order.orderId || order.invoice}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{order.name}</span>
              </div>
              {order.shippingDetails?.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking:</span>
                  <span className="font-mono text-xs">
                    {order.shippingDetails.trackingNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Confirmation Message */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Are you sure you want to mark this order as delivered?
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  This action will update the order status and send a delivery
                  confirmation email to the customer.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Mark as Delivered
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShippingActions: React.FC<ShippingActionsProps> = ({ order }) => {
  const [shipOrder] = useShipOrderMutation();
  const [updateStatus] = useUpdateStatusMutation();
  const [sendDeliveryNotification] = useSendDeliveryNotificationMutation();
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  const canShip = order.status === 'pending' || order.status === 'processing';
  const isShipped = order.status === 'shipped';
  const isDelivered = order.status === 'delivered';

  const handleShip = async (orderId: string, shippingData: any) => {
    try {
      const result = await shipOrder({
        id: orderId,
        shippingData,
      }).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleDeliver = async (orderId: string) => {
    try {
      // Use the delivery notification API which will:
      // 1. Update order status to 'delivered'
      // 2. Send delivery confirmation email to customer
      // 3. Update delivery tracking info
      await sendDeliveryNotification({
        id: orderId,
        deliveryData: {
          deliveredDate: new Date().toISOString(),
        },
      }).unwrap();
    } catch (error) {
      throw error;
    }
  };

  // Icon Components
  const ShippingIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  );

  const TruckIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
      />
    </svg>
  );

  const DeliveredIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );

  const PackageIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );

  // Delivered Status Display
  if (isDelivered) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          <DeliveredIcon />
          Delivered
        </div>
        {order.shippingDetails?.trackingNumber && (
          <span className="text-xs text-gray-600 font-mono">
            {order.shippingDetails.trackingNumber}
          </span>
        )}
      </div>
    );
  }

  // Shipped Status Display with Deliver Action
  if (isShipped) {
    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            <TruckIcon />
            Shipped
          </div>
          {order.shippingDetails?.trackingNumber && (
            <span className="text-xs text-gray-600 font-mono truncate">
              {order.shippingDetails.trackingNumber}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsDeliveryModalOpen(true)}
          className="flex items-center justify-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs w-full"
        >
          <DeliveredIcon />
          Mark Delivered
        </button>

        <DeliveryModal
          isOpen={isDeliveryModalOpen}
          onClose={() => setIsDeliveryModalOpen(false)}
          order={order}
          onDeliver={handleDeliver}
        />
      </div>
    );
  }

  // Ship Action for Pending/Processing Orders
  if (canShip) {
    return (
      <>
        <button
          onClick={() => setIsShippingModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          <ShippingIcon />
          Ship Order
        </button>

        <ShippingModal
          isOpen={isShippingModalOpen}
          onClose={() => setIsShippingModalOpen(false)}
          order={order}
          onShip={handleShip}
        />
      </>
    );
  }

  // Default case for orders that cannot be shipped
  return (
    <div className="flex items-center gap-1 text-xs text-gray-500">
      <PackageIcon />
      Cannot ship ({order.status})
    </div>
  );
};

export default ShippingActions;
