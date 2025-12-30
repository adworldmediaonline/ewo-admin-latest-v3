'use client';
import React, { useState, useEffect } from 'react';
import { useShipOrderMutation } from '@/redux/order/orderApi';
import { Order } from '@/types/order-amount-type';
import { Plus, Trash2 } from 'lucide-react';

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onShip: (id: string, data: any) => Promise<any>;
}

interface CarrierTrackingPair {
  carrier: string;
  trackingNumber: string;
}

const ShippingModal: React.FC<ShippingModalProps> = ({
  isOpen,
  onClose,
  order,
  onShip,
}) => {
  const [carriers, setCarriers] = useState<CarrierTrackingPair[]>([
    { carrier: 'UPS', trackingNumber: '' },
  ]);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Only UPS and USPS are allowed
  const allowedCarriers = ['UPS', 'USPS'];

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isLoading, onClose]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCarriers([{ carrier: 'UPS', trackingNumber: '' }]);
      setEstimatedDelivery('');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleAddCarrier = () => {
    setCarriers([...carriers, { carrier: 'UPS', trackingNumber: '' }]);
  };

  const handleRemoveCarrier = (index: number) => {
    if (carriers.length > 1) {
      setCarriers(carriers.filter((_, i) => i !== index));
    } else {
      setError('At least one carrier is required');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCarrierChange = (index: number, field: 'carrier' | 'trackingNumber', value: string) => {
    const updated = [...carriers];
    updated[index] = { ...updated[index], [field]: value };
    setCarriers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate at least one carrier is selected
    if (carriers.length === 0) {
      setError('At least one carrier is required');
      setIsLoading(false);
      return;
    }

    // Validate all carriers have a carrier name
    const invalidCarriers = carriers.filter(c => !c.carrier);
    if (invalidCarriers.length > 0) {
      setError('All carriers must have a carrier name selected');
      setIsLoading(false);
      return;
    }

    try {
      // Prepare shipping data with multiple carriers
      // Filter out empty tracking numbers but keep the carrier
      const shippingData = {
        carriers: carriers
          .filter(c => c.carrier && c.carrier.trim() !== '') // Only include carriers with valid carrier name
          .map(c => ({
            carrier: c.carrier.trim(),
            trackingNumber: c.trackingNumber && c.trackingNumber.trim() !== ''
              ? c.trackingNumber.trim()
              : undefined,
          })),
        estimatedDelivery: estimatedDelivery && estimatedDelivery.trim() !== ''
          ? estimatedDelivery.trim()
          : undefined,
      };

      // Debug: Log what we're sending
      console.log('📤 Frontend sending shipping data:', JSON.stringify(shippingData, null, 2));
      console.log('📦 Number of carriers:', shippingData.carriers.length);
      console.log('📦 Carriers details:', shippingData.carriers.map(c => ({
        carrier: c.carrier,
        hasTracking: !!c.trackingNumber,
      })));

      if (shippingData.carriers.length === 0) {
        setError('At least one valid carrier is required');
        setIsLoading(false);
        return;
      }

      await onShip(order._id, shippingData);

      setSuccess(
        'Order shipped successfully! Customer has been notified via email.'
      );

      setTimeout(() => {
        onClose();
        setCarriers([{ carrier: 'UPS', trackingNumber: '' }]);
        setEstimatedDelivery('');
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to ship order');
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto my-8 transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ship Order</h2>
            <p className="text-sm text-gray-500 mt-1">
              Process shipment and notify customer
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6 text-gray-400"
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
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Order Info Card */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Order Details</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 whitespace-nowrap">
                  Order ID:
                </span>
                <span className="font-medium text-gray-900 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  #{order.orderId || order.invoice}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 whitespace-nowrap">
                  Customer:
                </span>
                <span className="font-medium text-gray-900 text-right truncate max-w-[200px]">
                  {order.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 whitespace-nowrap">Email:</span>
                <span className="font-medium text-gray-900 text-right truncate max-w-[200px]">
                  {order.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 whitespace-nowrap">Total:</span>
                <span className="font-bold text-green-600">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 whitespace-nowrap">Status:</span>
                <span className="font-medium text-blue-600 capitalize bg-blue-50 px-2 py-1 rounded">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Multiple Carriers Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Shipping Carriers <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddCarrier}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Carrier
                </button>
              </div>

              <div className="space-y-4">
                {carriers.map((carrierPair, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Carrier {index + 1}
                      </span>
                      {carriers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCarrier(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label={`Remove carrier ${index + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Carrier Selection */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Carrier <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={carrierPair.carrier}
                            onChange={e =>
                              handleCarrierChange(index, 'carrier', e.target.value)
                            }
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white text-sm"
                          >
                            {allowedCarriers.map(carrier => (
                              <option key={carrier} value={carrier}>
                                {carrier}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
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
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Tracking Number */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Tracking Number
                        </label>
                        <input
                          type="text"
                          value={carrierPair.trackingNumber}
                          onChange={e =>
                            handleCarrierChange(
                              index,
                              'trackingNumber',
                              e.target.value
                            )
                          }
                          placeholder="Enter tracking number (optional)"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Can be added later if not available yet
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Delivery */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Delivery Date
              </label>
              <input
                type="date"
                value={estimatedDelivery}
                onChange={e => setEstimatedDelivery(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Email Notification Info */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
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
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800 mb-2">
                    Automatic Email Notification
                  </p>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      Complete order details and items
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      All shipping carriers and tracking information
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      Estimated delivery date
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      Direct tracking links (if tracking numbers provided)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-red-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-green-600">
                    {success}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Shipping...
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Ship & Notify Customer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingModal;
