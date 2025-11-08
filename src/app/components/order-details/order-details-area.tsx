'use client';
import {
  useCancelOrderMutation,
  useGetPaymentDetailsQuery,
  useGetSingleOrderQuery,
  useProcessRefundMutation,
} from '@/redux/order/orderApi';
import dayjs from 'dayjs';
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  CheckCircle,
  CheckIcon,
  Clock,
  CopyIcon,
  CreditCard,
  DollarSign,
  Download,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  RefreshCw,
  ShoppingCart,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface OrderDetailsAreaProps {
  id: string;
  role: 'admin' | 'super-admin';
}

export default function OrderDetailsArea({ id, role }: OrderDetailsAreaProps) {
  const { data: orderData, error, isLoading } = useGetSingleOrderQuery(id);
  const { data: paymentData, refetch: refetchPaymentData } =
    useGetPaymentDetailsQuery(id);
  const [processRefund, { isLoading: isRefunding }] =
    useProcessRefundMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  // Modal states
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('requested_by_customer');
  const [cancelReason, setCancelReason] = useState('requested_by_customer');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Handle refund submission
  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundAmount || parseFloat(refundAmount) <= 0) return;

    try {
      await processRefund({
        id,
        refundData: {
          amount: Math.round(parseFloat(refundAmount) * 100), // Convert to cents
          reason: refundReason,
        },
      }).unwrap();

      setShowRefundModal(false);
      setRefundAmount('');
      refetchPaymentData();
      alert('Refund processed successfully!');
    } catch (error: any) {
      alert(`Refund failed: ${error.data?.message || error.message}`);
    }
  };

  // Handle order cancellation
  const handleCancel = async () => {
    try {
      await cancelOrder({
        id,
        cancelData: { reason: cancelReason },
      }).unwrap();

      setShowCancelModal(false);
      refetchPaymentData();
      alert('Order cancelled successfully!');
    } catch (error: any) {
      alert(`Cancellation failed: ${error.data?.message || error.message}`);
    }
  };

  // Handle copy address
  const handleCopyAddress = async () => {
    const addressText = `${order.name}\n${order.address}\n${order.city}, ${order.state} ${order.zipCode}\n${order.country}`;

    try {
      await navigator.clipboard.writeText(addressText);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = addressText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  // Handle copy email
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(order.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (error) {
      console.error('Failed to copy email:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = order.email;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  // Handle copy phone
  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(order.contact);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch (error) {
      console.error('Failed to copy phone:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = order.contact;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  // Calculate refundable amount
  const getRefundableAmount = () => {
    if (!paymentData?.data) return 0;
    const totalAmount = paymentData.data.totalAmount || 0;
    const refundedAmount = (paymentData.data.refundedAmount || 0) / 100; // Convert from cents
    return Math.max(0, totalAmount - refundedAmount);
  };

  // Helper function to safely render string values from potentially nested objects
  const safeRenderString = (value: any, fallback: string = ''): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object' && value !== null) {
      if (value.title) return safeRenderString(value.title, fallback);
      if (value.name) return safeRenderString(value.name, fallback);
      return JSON.stringify(value);
    }
    return fallback;
  };

  // Helper function to safely extract numeric values
  const safeRenderNumber = (value: any, fallback: number = 0): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? fallback : parsed;
    }
    if (typeof value === 'object' && value !== null) {
      if (value.price) return safeRenderNumber(value.price, fallback);
      if (value.amount) return safeRenderNumber(value.amount, fallback);
    }
    return fallback;
  };

  // Helper function to render product options (handles both selectedOption and options array)
  const renderProductOptions = (options: any) => {
    if (!options) return null;

    // Handle single selectedOption object (preferred format)
    if (typeof options === 'object' && !Array.isArray(options) && options.title) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
          {safeRenderString(options.title)}
          {Number(options.price || 0) > 0 && (
            <span className="ml-1 text-green-600 dark:text-green-400 font-medium">
              (+${Number(options.price || 0).toFixed(2)})
            </span>
          )}
        </span>
      );
    }

    // Handle array of options (legacy support)
    if (Array.isArray(options)) {
      return options.map((option: any, index: number) => (
        <span
          key={option._id || index}
          className="inline-flex items-center px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
        >
          {safeRenderString(option.title)}
          {Number(option.price || 0) > 0 && (
            <span className="ml-1 text-green-600 dark:text-green-400 font-medium">
              (+${Number(option.price || 0).toFixed(2)})
            </span>
          )}
        </span>
      ));
    }

    // Handle string
    return safeRenderString(options);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    console.log('Download invoice');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card rounded-xl shadow-lg p-8 max-w-sm w-full mx-4 border border-border">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Loading Order Details
            </h3>
            <p className="text-muted-foreground text-sm">
              Please wait while we fetch the order information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card rounded-xl shadow-lg p-8 max-w-md w-full mx-4 border border-border">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Order Not Found
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              We couldn't find the order you're looking for. It may have been
              deleted or the ID is incorrect.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
              <Link
                href={`/dashboard/${role}/orders`}
                className="inline-flex items-center justify-center w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const order = orderData;
  const statusColor = order.status?.toLowerCase();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-card rounded-xl shadow-sm border border-border mb-8">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center">
                <Link
                  href={`/dashboard/${role}/orders`}
                  className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="font-medium">Back to Orders</span>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          {/* Order Header Section */}
          <div className="px-6 py-6 border-b border-border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  Order #{order.orderId || order.invoice}
                </h1>
                <p className="text-muted-foreground text-sm">
                  Placed on{' '}
                  {dayjs(order.createdAt).format('MMMM D, YYYY at h:mm A')}
                </p>
              </div>
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusColor === 'delivered'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : statusColor === 'cancelled'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : statusColor === 'processing'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-muted text-muted-foreground'
                  }`}
              >
                {statusColor === 'delivered' && (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {statusColor === 'cancelled' && (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                {(statusColor === 'pending' ||
                  statusColor === 'processing') && (
                    <Clock className="w-4 h-4 mr-2" />
                  )}
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </div>
            </div>

            {/* Order Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
              <div className="bg-accent/50 rounded-lg p-4 border border-border/50">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-foreground">
                      {order.cart?.reduce(
                        (acc: number, item: any) => acc + item.orderQuantity,
                        0
                      ) || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Items
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-accent/50 rounded-lg p-4 border border-border/50">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-foreground">
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Amount
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-accent/50 rounded-lg p-4 border border-border/50">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-foreground">
                      {order.isGuestOrder ? 'Guest' : 'Registered'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Customer Type
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {order.orderNote && (
              <div className="mt-6 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-2" />
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    Order Note
                  </h4>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  {order.orderNote}
                </p>
              </div>
            )}
          </div>

          {/* Payment Management Section */}
          {order.paymentMethod === 'Card' &&
            order.status !== 'cancel' &&
            paymentData?.data?.refundable && (
              <div className="px-6 py-6 border-b border-border">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-5 h-5 text-primary mr-2" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Payment Management
                  </h2>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payment Status */}
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-medium text-foreground mb-4">
                        Payment Status
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Total Paid:
                          </span>
                          <span className="font-semibold text-foreground">
                            ${order.totalAmount?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Refunded:
                          </span>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            $
                            {(
                              (paymentData?.data?.refundedAmount || 0) / 100
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Refundable:
                          </span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ${getRefundableAmount().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-medium text-foreground mb-4">
                        Actions
                      </h3>
                      <div className="space-y-3">
                        {getRefundableAmount() > 0 && (
                          <button
                            onClick={() => setShowRefundModal(true)}
                            className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            disabled={isRefunding}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {isRefunding ? 'Processing...' : 'Process Refund'}
                          </button>
                        )}
                        {order.status !== 'shipped' &&
                          order.status !== 'delivered' && (
                            <button
                              onClick={() => setShowCancelModal(true)}
                              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                              disabled={isCancelling}
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Refund History */}
                  {paymentData?.data?.paymentIntent?.refunds &&
                    paymentData.data.paymentIntent.refunds.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-medium text-foreground mb-4">
                          Refund History
                        </h3>
                        <div className="space-y-4">
                          {paymentData.data.paymentIntent.refunds.map(
                            (refund: any, index: number) => (
                              <div
                                key={refund.refundId || index}
                                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
                              >
                                <div className="flex flex-col space-y-1">
                                  <span className="font-medium text-foreground">
                                    #{refund.refundId}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {refund.reason}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {dayjs(refund.createdAt).format(
                                      'MMM D, YYYY h:mm A'
                                    )}
                                  </span>
                                </div>
                                <div className="font-semibold text-foreground">
                                  ${(refund.amount / 100).toFixed(2)}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

          {/* Order Items Section */}
          <div className="px-6 py-6 border-b border-border">
            <div className="flex items-center mb-6">
              <Package className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-foreground">
                Order Items ({order.cart?.length || 0})
              </h2>
            </div>
            <div className="space-y-6">
              {order.cart && order.cart.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {order?.cart?.map((item: any, index: number) => (
                        <tr key={index} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0 w-12 h-12">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={safeRenderString(
                                      item.title,
                                      'Product Image'
                                    )}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-lg object-cover border border-border"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                    <Package className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-foreground truncate">
                                  {safeRenderString(item.title, 'Product Name')}
                                </h4>
                                {(item.selectedOption || item.options) && (
                                  <div className="mt-1">
                                    <div className="flex flex-wrap gap-1">
                                      {renderProductOptions(item.selectedOption || item.options)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-muted-foreground">
                              {item.sku || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                              {item.orderQuantity || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-foreground">
                              ${safeRenderNumber(item.finalPriceDiscount || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-foreground">
                              $
                              {(
                                safeRenderNumber(item.finalPriceDiscount || 0) *
                                (item.orderQuantity || 0)
                              ).toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No Items Found
                  </h3>
                  <p className="text-muted-foreground">
                    This order doesn't contain any items.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="px-6 py-6 border-b border-border">
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-foreground">
                Customer Information
              </h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${order.user?.imageURL ? 'bg-transparent' : 'bg-muted'
                    }`}
                >
                  {order.user?.imageURL ? (
                    <Image
                      src={order.user.imageURL}
                      alt="Customer"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {order.isGuestOrder
                      ? order.name
                      : order.user?.name || order.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${order.isGuestOrder
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}
                  >
                    {order.isGuestOrder
                      ? 'Guest Customer'
                      : 'Registered Customer'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Email Address
                      </span>
                      <button
                        onClick={handleCopyEmail}
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors duration-200 ${copiedEmail
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          }`}
                        title="Copy email address"
                        type="button"
                      >
                        {copiedEmail ? (
                          <>
                            <CheckIcon className="w-3 h-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <CopyIcon className="w-3 h-3 mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <span className="text-sm text-foreground">
                      {order.email}
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Phone Number
                      </span>
                      <button
                        onClick={handleCopyPhone}
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors duration-200 ${copiedPhone
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          }`}
                        title="Copy phone number"
                        type="button"
                      >
                        {copiedPhone ? (
                          <>
                            <CheckIcon className="w-3 h-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <CopyIcon className="w-3 h-3 mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <span className="text-sm text-foreground">
                      {order.contact}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Shipping Address
                      </span>
                      <button
                        onClick={handleCopyAddress}
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors duration-200 ${copiedAddress
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          }`}
                        title="Copy shipping address"
                        type="button"
                      >
                        {copiedAddress ? (
                          <>
                            <CheckIcon className="w-3 h-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <CopyIcon className="w-3 h-3 mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <address className="text-sm text-foreground not-italic">
                      <div className="font-medium">{order.name}</div>
                      <div>{order.address}</div>
                      <div>
                        {order.city}, {order.state} {order.zipCode}
                      </div>
                      <div>{order.country}</div>
                    </address>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline Section */}
          <div className="px-6 py-6 border-b border-border">
            <div className="flex items-center mb-6">
              <Clock className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-foreground">
                Order Timeline
              </h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-8">
                {/* Order Placed */}
                <div className="relative flex items-start space-x-4">
                  <div className="absolute left-6 top-12 w-px h-16 bg-border"></div>
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          Order Placed
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your order has been successfully placed and confirmed.
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {dayjs(order.createdAt).format('MMM D, YYYY')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dayjs(order.createdAt).format('h:mm A')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* {order.status !== 'cancel' && (
                  <>
                    <div className="relative flex items-start space-x-4">
                      <div className="absolute left-6 top-12 w-px h-16 bg-border"></div>
                      <div className="flex-shrink-0">
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full ${
                            order.status === 'shipped' ||
                            order.status === 'delivered'
                              ? 'bg-green-100 dark:bg-green-900'
                              : 'bg-muted'
                          }`}
                        >
                          {order.status === 'shipped' ||
                          order.status === 'delivered' ? (
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )} */}

                {order.status !== 'cancel' && (
                  <>
                    <div className="relative flex items-start space-x-4">
                      <div className="absolute left-6 top-12 w-px h-16 bg-border"></div>
                      <div className="flex-shrink-0">
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full ${order.status === 'shipped' ||
                              order.status === 'delivered'
                              ? 'bg-blue-100 dark:bg-blue-900'
                              : 'bg-muted'
                            }`}
                        >
                          {order.status === 'shipped' ||
                            order.status === 'delivered' ? (
                            <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4
                              className={`text-sm font-semibold ${order.status === 'shipped' ||
                                  order.status === 'delivered'
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                                }`}
                            >
                              Order Shipped
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Your order has been shipped and is on its way.
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-right">
                              {order.status === 'shipped' && (
                                <>
                                  <p className="text-sm font-medium text-foreground">
                                    {dayjs(order.updatedAt).format(
                                      'MMM D, YYYY'
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {dayjs(order.updatedAt).format('h:mm A')}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {order.status !== 'cancel' && (
                  <>
                    <div className="relative flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full ${order.status === 'delivered'
                              ? 'bg-green-100 dark:bg-green-900'
                              : 'bg-muted'
                            }`}
                        >
                          {order.status === 'delivered' ? (
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4
                              className={`text-sm font-semibold ${order.status === 'delivered'
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                                }`}
                            >
                              Order Delivered
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Your order has been successfully delivered.
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-right">
                              {order.status === 'delivered' && (
                                <>
                                  <p className="text-sm font-medium text-foreground">
                                    {dayjs(order.updatedAt).format(
                                      'MMM D, YYYY'
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {dayjs(order.updatedAt).format('h:mm A')}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {order.status === 'cancel' && (
                  <>
                    <div className="relative flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full">
                          <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">
                              Order Cancelled
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              This order has been cancelled.
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-right">
                              {order.status === 'cancel' && (
                                <>
                                  <p className="text-sm font-medium text-foreground">
                                    {dayjs(order.updatedAt).format(
                                      'MMM D, YYYY'
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {dayjs(order.updatedAt).format('h:mm A')}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Payment Summary Section */}
          <div className="px-6 py-6">
            <div className="flex items-center mb-6">
              <CreditCard className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-foreground">
                Payment Summary
              </h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">
                    Payment Method
                  </h3>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground">
                          {order.paymentMethod}
                        </h4>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Payment Completed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Subtotal
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        ${order?.subTotal?.toFixed(2)}
                      </span>
                    </div>
                    {(order.shippingCost || 0) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Shipping
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          ${(order.shippingCost || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {(order.discount || 0) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Discount
                        </span>
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          -${(order.discount || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {order.firstTimeDiscount?.isApplied && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          First-time Discount
                        </span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          -${order.firstTimeDiscount.amount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-foreground">
                          Total
                        </span>
                        <span className="text-base font-bold text-foreground">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Section */}
          {/* <div className={styles.quickStats}>
            <h3 className={styles.quickStatsTitle}>Quick Stats</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {order.cart?.reduce((acc: number, item: any) => acc + item.orderQuantity, 0) || 0}
                </div>
                <div className={styles.statLabel}>Items</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>${order.totalAmount?.toFixed(0) || '0'}</div>
                <div className={styles.statLabel}>Total</div>
              </div>
            </div>
            <div className={styles.invoiceSection}>
              <p className={styles.invoiceLabel}>Invoice Number</p>
              <p className={styles.invoiceNumber}>#{order.invoice}</p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowRefundModal(false)}
        >
          <div
            className="bg-card rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Process Refund
              </h3>
              <button
                onClick={() => setShowRefundModal(false)}
                className="p-1 hover:bg-muted rounded-lg transition-colors duration-200"
              >
                <XCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleRefund}>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="refundAmount"
                    className="block text-sm font-medium text-foreground"
                  >
                    Refund Amount ($)
                  </label>
                  <input
                    id="refundAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={getRefundableAmount()}
                    value={refundAmount}
                    onChange={e => setRefundAmount(e.target.value)}
                    placeholder={`Max: $${getRefundableAmount().toFixed(2)}`}
                    required
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="refundReason"
                    className="block text-sm font-medium text-foreground"
                  >
                    Reason
                  </label>
                  <select
                    id="refundReason"
                    value={refundReason}
                    onChange={e => setRefundReason(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200"
                  >
                    <option value="requested_by_customer">
                      Requested by Customer
                    </option>
                    <option value="duplicate">Duplicate Charge</option>
                    <option value="fraudulent">Fraudulent</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/50">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRefunding || !refundAmount}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                >
                  {isRefunding ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="bg-card rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Cancel Order
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 hover:bg-muted rounded-lg transition-colors duration-200"
              >
                <XCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Are you sure you want to cancel this order?
                    {order.paymentMethod === 'Card' &&
                      ' A full refund will be processed automatically.'}
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="cancelReason"
                  className="block text-sm font-medium text-foreground"
                >
                  Cancellation Reason
                </label>
                <select
                  id="cancelReason"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200"
                >
                  <option value="requested_by_customer">
                    Requested by Customer
                  </option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="payment_failed">Payment Failed</option>
                  <option value="duplicate">Duplicate Order</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/50">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-colors duration-200"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
