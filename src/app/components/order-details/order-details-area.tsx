'use client';
import {
  useCancelOrderMutation,
  useGetPaymentDetailsQuery,
  useGetSingleOrderQuery,
  useProcessRefundMutation,
} from '@/redux/order/orderApi';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Icon Components
const ArrowLeft = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const Printer = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
    />
  </svg>
);

const Download = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
    />
  </svg>
);

const Package = ({ className }: { className?: string }) => (
  <svg
    className={className}
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

const User = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const Mail = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const Phone = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const MapPin = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const Truck = ({ className }: { className?: string }) => (
  <svg
    className={className}
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
);

const Clock = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CheckCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
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
);

const XCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CreditCard = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

const ShoppingCart = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 005 16h2m0 0v6a2 2 0 002 2h2a2 2 0 002-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v7.586l.293.293A1 1 0 008 16h2m8 0v6a2 2 0 002 2h2a2 2 0 002-2v-6"
    />
  </svg>
);

const DollarSign = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
);

const RefundIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
    />
  </svg>
);

const CancelIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
    />
  </svg>
);

const CopyIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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

interface OrderDetailsAreaProps {
  id: string;
}

export default function OrderDetailsArea({ id }: OrderDetailsAreaProps) {
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

  // Helper function to render product options
  const renderProductOptions = (options: any) => {
    if (!options) return null;

    // Handle array of options
    if (Array.isArray(options)) {
      return options.map((option: any, index: number) => (
        <span key={option._id || index} className={styles.optionItem}>
          {safeRenderString(option.title)}
          {option.price > 0 && (
            <span className={styles.optionPrice}>
              (+${safeRenderNumber(option.price).toFixed(2)})
            </span>
          )}
        </span>
      ));
    }

    // Handle single option object
    if (typeof options === 'object' && options.title) {
      return (
        <span className={styles.optionItem}>
          {safeRenderString(options.title)}
          {options.price > 0 && (
            <span className={styles.optionPrice}>
              (+${safeRenderNumber(options.price).toFixed(2)})
            </span>
          )}
        </span>
      );
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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingAnimation}>
            <div className={styles.spinner}></div>
          </div>
          <div className={styles.loadingContent}>
            <h3 className={styles.loadingTitle}>Loading Order Details</h3>
            <p className={styles.loadingSubtitle}>
              Please wait while we fetch the order information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>
            <AlertCircle className={styles.errorIconSvg} />
          </div>
          <h3 className={styles.errorTitle}>Order Not Found</h3>
          <p className={styles.errorMessage}>
            We couldn't find the order you're looking for. It may have been
            deleted or the ID is incorrect.
          </p>
          <div className={styles.errorActions}>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Try Again
            </button>
            <Link href="/orders" className={styles.backToOrdersButton}>
              <ArrowLeft className={styles.buttonIcon} />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const order = orderData;
  const statusColor = order.status?.toLowerCase();

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.navigationSection}>
              <Link href="/orders" className={styles.backButton}>
                <ArrowLeft className={styles.backIcon} />
                Back to Orders
              </Link>
            </div>
            <div className={styles.actionButtons}>
              <button onClick={handlePrint} className={styles.printButton}>
                <Printer className={styles.buttonIcon} />
                Print
              </button>
              <button
                onClick={handleDownload}
                className={styles.downloadButton}
              >
                <Download className={styles.buttonIcon} />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Unified Content Card */}
        <div className={styles.unifiedCard}>
          {/* Order Header Section */}
          <div className={styles.orderHeaderSection}>
            <div className={styles.orderTitleRow}>
              <div className={styles.orderTitleInfo}>
                <h1>Order #{order.orderId || order.invoice}</h1>
                <p className={styles.orderDate}>
                  Placed on{' '}
                  {dayjs(order.createdAt).format('MMMM D, YYYY at h:mm A')}
                </p>
              </div>
              <div
                className={`${styles.statusBadge} ${
                  styles[statusColor] || styles.pending
                }`}
              >
                {statusColor === 'delivered' && (
                  <CheckCircle className={styles.statusIcon} />
                )}
                {statusColor === 'cancelled' && (
                  <XCircle className={styles.statusIcon} />
                )}
                {(statusColor === 'pending' ||
                  statusColor === 'processing') && (
                  <Clock className={styles.statusIcon} />
                )}
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </div>
            </div>

            <div className={styles.orderMetrics}>
              <div className={styles.metricItem}>
                <ShoppingCart className={styles.metricIcon} />
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {order.cart?.reduce(
                      (acc: number, item: any) => acc + item.orderQuantity,
                      0
                    ) || 0}
                  </div>
                  <div className={styles.metricText}>Total Items</div>
                </div>
              </div>
              <div className={styles.metricItem}>
                <DollarSign className={styles.metricIcon} />
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    ${order.totalAmount?.toFixed(2) || '0.00'}
                  </div>
                  <div className={styles.metricText}>Total Amount</div>
                </div>
              </div>
              <div className={styles.metricItem}>
                <User className={styles.metricIcon} />
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {order.isGuestOrder ? 'Guest' : 'Registered'}
                  </div>
                  <div className={styles.metricText}>Customer Type</div>
                </div>
              </div>
            </div>

            {order.orderNote && (
              <div className={styles.orderNote}>
                <div className={styles.orderNoteHeader}>
                  <AlertCircle className={styles.orderNoteIcon} />
                  <h4 className={styles.orderNoteTitle}>Order Note</h4>
                </div>
                <p className={styles.orderNoteText}>{order.orderNote}</p>
              </div>
            )}
          </div>

          {/* Payment Management Section */}
          {order.paymentMethod === 'Card' &&
            order.status !== 'cancel' &&
            paymentData?.data?.refundable && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    <CreditCard className={styles.sectionIcon} />
                    Payment Management
                  </h2>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.paymentManagementGrid}>
                    {/* Payment Status */}
                    <div className={styles.paymentStatusCard}>
                      <h3>Payment Status</h3>
                      <div className={styles.paymentDetails}>
                        <div className={styles.paymentRow}>
                          <span>Total Paid:</span>
                          <span className={styles.amount}>
                            ${order.totalAmount?.toFixed(2)}
                          </span>
                        </div>
                        <div className={styles.paymentRow}>
                          <span>Refunded:</span>
                          <span className={styles.refundedAmount}>
                            $
                            {(
                              (paymentData?.data?.refundedAmount || 0) / 100
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className={styles.paymentRow}>
                          <span>Refundable:</span>
                          <span className={styles.refundableAmount}>
                            ${getRefundableAmount().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.paymentActionsCard}>
                      <h3>Actions</h3>
                      <div className={styles.actionButtons}>
                        {getRefundableAmount() > 0 && (
                          <button
                            onClick={() => setShowRefundModal(true)}
                            className={styles.refundButton}
                            disabled={isRefunding}
                          >
                            <RefundIcon className={styles.buttonIcon} />
                            Process Refund
                          </button>
                        )}
                        {order.status !== 'shipped' &&
                          order.status !== 'delivered' && (
                            <button
                              onClick={() => setShowCancelModal(true)}
                              className={styles.cancelButton}
                              disabled={isCancelling}
                            >
                              <CancelIcon className={styles.buttonIcon} />
                              Cancel Order
                            </button>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Refund History */}
                  {paymentData?.data?.paymentIntent?.refunds &&
                    paymentData.data.paymentIntent.refunds.length > 0 && (
                      <div className={styles.refundHistory}>
                        <h3>Refund History</h3>
                        <div className={styles.refundList}>
                          {paymentData.data.paymentIntent.refunds.map(
                            (refund: any, index: number) => (
                              <div
                                key={refund.refundId || index}
                                className={styles.refundItem}
                              >
                                <div className={styles.refundDetails}>
                                  <span className={styles.refundId}>
                                    #{refund.refundId}
                                  </span>
                                  <span className={styles.refundReason}>
                                    {refund.reason}
                                  </span>
                                  <span className={styles.refundDate}>
                                    {dayjs(refund.createdAt).format(
                                      'MMM D, YYYY h:mm A'
                                    )}
                                  </span>
                                </div>
                                <div className={styles.refundAmount}>
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
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Package className={styles.sectionIcon} />
                Order Items ({order.cart?.length || 0})
              </h2>
            </div>
            <div className={styles.sectionContent}>
              {order.cart && order.cart.length > 0 ? (
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.cart.map((item: any, index: number) => (
                        <tr key={index} className={styles.tableRow}>
                          <td className={styles.tableCell}>
                            <div className={styles.productInfo}>
                              <div className={styles.productImageContainer}>
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={safeRenderString(
                                      item.title,
                                      'Product Image'
                                    )}
                                    width={48}
                                    height={48}
                                    className={styles.productImage}
                                  />
                                ) : (
                                  <Package className={styles.sectionIcon} />
                                )}
                              </div>
                              <div className={styles.productDetails}>
                                <h4 className={styles.productTitle}>
                                  {safeRenderString(item.title, 'Product Name')}
                                </h4>
                                {item.options && (
                                  <div className={styles.productOptions}>
                                    <div className={styles.availableOptions}>
                                      {renderProductOptions(item.options)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className={styles.tableCell}>
                            <span className={styles.skuText}>
                              {safeRenderString(item.sku, 'N/A')}
                            </span>
                          </td>
                          <td className={styles.tableCell}>
                            <span className={styles.quantityBadge}>
                              {item.orderQuantity || 0}
                            </span>
                          </td>
                          <td className={styles.tableCell}>
                            <span className={styles.priceText}>
                              ${safeRenderNumber(item.price).toFixed(2)}
                            </span>
                          </td>
                          <td className={styles.tableCell}>
                            <span className={styles.totalPrice}>
                              $
                              {(
                                safeRenderNumber(item.price) *
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
                <div className={styles.emptyOrderItems}>
                  <Package className={styles.sectionIcon} />
                  <h3>No Items Found</h3>
                  <p>This order doesn't contain any items.</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <User className={styles.sectionIcon} />
                Customer Information
              </h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.customerProfile}>
                <div
                  className={
                    order.user?.imageURL
                      ? styles.customerAvatar
                      : styles.customerAvatarPlaceholder
                  }
                >
                  {order.user?.imageURL ? (
                    <Image
                      src={order.user.imageURL}
                      alt="Customer"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <User className={styles.customerAvatarIcon} />
                  )}
                </div>
                <div className={styles.customerInfo}>
                  <h3 className={styles.customerName}>
                    {order.isGuestOrder
                      ? order.name
                      : order.user?.name || order.name}
                  </h3>
                  <span
                    className={`${styles.customerType} ${
                      order.isGuestOrder ? styles.guest : styles.registered
                    }`}
                  >
                    {order.isGuestOrder
                      ? 'Guest Customer'
                      : 'Registered Customer'}
                  </span>
                </div>
              </div>

              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <Mail className={styles.contactIcon} />
                  <div className={styles.contactDetails}>
                    <div className={styles.contactLabelWithCopy}>
                      <span className={styles.contactLabel}>Email Address</span>
                      <button
                        onClick={handleCopyEmail}
                        className={`${styles.copyButton} ${
                          copiedEmail ? styles.copySuccess : ''
                        }`}
                        title="Copy email address"
                        type="button"
                      >
                        {copiedEmail ? (
                          <>
                            <CheckIcon className={styles.copyIcon} />
                            <span className={styles.copyTooltip}>Copied!</span>
                          </>
                        ) : (
                          <>
                            <CopyIcon className={styles.copyIcon} />
                            <span className={styles.copyTooltip}>
                              Copy Email
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                    <span className={styles.contactText}>{order.email}</span>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <Phone className={styles.contactIcon} />
                  <div className={styles.contactDetails}>
                    <div className={styles.contactLabelWithCopy}>
                      <span className={styles.contactLabel}>Phone Number</span>
                      <button
                        onClick={handleCopyPhone}
                        className={`${styles.copyButton} ${
                          copiedPhone ? styles.copySuccess : ''
                        }`}
                        title="Copy phone number"
                        type="button"
                      >
                        {copiedPhone ? (
                          <>
                            <CheckIcon className={styles.copyIcon} />
                            <span className={styles.copyTooltip}>Copied!</span>
                          </>
                        ) : (
                          <>
                            <CopyIcon className={styles.copyIcon} />
                            <span className={styles.copyTooltip}>
                              Copy Phone
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                    <span className={styles.contactText}>{order.contact}</span>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <MapPin className={styles.contactIcon} />
                  <div className={styles.contactDetails}>
                    <div className={styles.contactLabelWithCopy}>
                      <span className={styles.contactLabel}>
                        Shipping Address
                      </span>
                      <button
                        onClick={handleCopyAddress}
                        className={`${styles.copyButton} ${
                          copiedAddress ? styles.copySuccess : ''
                        }`}
                        title="Copy shipping address"
                        type="button"
                      >
                        {copiedAddress ? (
                          <>
                            <CheckIcon className={styles.copyIcon} />
                            <span className={styles.copyTooltip}>Copied!</span>
                          </>
                        ) : (
                          <>
                            <CopyIcon className={styles.copyIcon} />
                            <span className={styles.copyTooltip}>
                              Copy Address
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                    <address className={styles.contactText}>
                      <span className={styles.addressName}>{order.name}</span>
                      <span className={styles.addressLine}>
                        {order.address}
                      </span>
                      <span className={styles.addressLine}>
                        {order.city}, {order.state} {order.zipCode}
                      </span>
                      <span className={styles.addressLine}>
                        {order.country}
                      </span>
                    </address>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Clock className={styles.sectionIcon} />
                Order Timeline
              </h2>
            </div>
            <div className={styles.sectionContent}>
              <ul className={styles.timelineList}>
                <li className={styles.timelineItem}>
                  <div className={styles.timelineConnector}></div>
                  <div className={styles.timelineContent}>
                    <div
                      className={`${styles.timelineIcon} ${styles.completed}`}
                    >
                      <CheckCircle className={styles.timelineIconInner} />
                    </div>
                    <div className={styles.timelineDetails}>
                      <h4
                        className={`${styles.timelineName} ${styles.completed}`}
                      >
                        Order Placed
                      </h4>
                      <p className={styles.timelineDescription}>
                        Your order has been successfully placed and confirmed.
                      </p>
                    </div>
                    <div className={styles.timelineDate}>
                      <p className={styles.timelineDateMain}>
                        {dayjs(order.createdAt).format('MMM D, YYYY')}
                      </p>
                      <p className={styles.timelineDateSub}>
                        {dayjs(order.createdAt).format('h:mm A')}
                      </p>
                    </div>
                  </div>
                </li>

                {order.status !== 'cancelled' && (
                  <li className={styles.timelineItem}>
                    <div className={styles.timelineConnector}></div>
                    <div className={styles.timelineContent}>
                      <div
                        className={`${styles.timelineIcon} ${
                          order.status === 'processing' ||
                          order.status === 'shipped' ||
                          order.status === 'delivered'
                            ? styles.completed
                            : styles.pending
                        }`}
                      >
                        {order.status === 'processing' ||
                        order.status === 'shipped' ||
                        order.status === 'delivered' ? (
                          <CheckCircle className={styles.timelineIconInner} />
                        ) : (
                          <div className={styles.timelineIconDot}></div>
                        )}
                      </div>
                      <div className={styles.timelineDetails}>
                        <h4
                          className={`${styles.timelineName} ${
                            order.status === 'processing' ||
                            order.status === 'shipped' ||
                            order.status === 'delivered'
                              ? styles.completed
                              : styles.pending
                          }`}
                        >
                          Order Processing
                        </h4>
                        <p className={styles.timelineDescription}>
                          Your order is being prepared and processed.
                        </p>
                      </div>
                      <div className={styles.timelineDate}>
                        <p className={styles.timelineDateMain}>-</p>
                        <p className={styles.timelineDateSub}>-</p>
                      </div>
                    </div>
                  </li>
                )}

                {order.status !== 'cancelled' && (
                  <li className={styles.timelineItem}>
                    <div className={styles.timelineConnector}></div>
                    <div className={styles.timelineContent}>
                      <div
                        className={`${styles.timelineIcon} ${
                          order.status === 'shipped' ||
                          order.status === 'delivered'
                            ? styles.completed
                            : styles.pending
                        }`}
                      >
                        {order.status === 'shipped' ||
                        order.status === 'delivered' ? (
                          <Truck className={styles.timelineIconInner} />
                        ) : (
                          <div className={styles.timelineIconDot}></div>
                        )}
                      </div>
                      <div className={styles.timelineDetails}>
                        <h4
                          className={`${styles.timelineName} ${
                            order.status === 'shipped' ||
                            order.status === 'delivered'
                              ? styles.completed
                              : styles.pending
                          }`}
                        >
                          Order Shipped
                        </h4>
                        <p className={styles.timelineDescription}>
                          Your order has been shipped and is on its way.
                        </p>
                      </div>
                      <div className={styles.timelineDate}>
                        <p className={styles.timelineDateMain}>-</p>
                        <p className={styles.timelineDateSub}>-</p>
                      </div>
                    </div>
                  </li>
                )}

                {order.status !== 'cancelled' && (
                  <li className={styles.timelineItem}>
                    <div className={styles.timelineContent}>
                      <div
                        className={`${styles.timelineIcon} ${
                          order.status === 'delivered'
                            ? styles.completed
                            : styles.pending
                        }`}
                      >
                        {order.status === 'delivered' ? (
                          <CheckCircle className={styles.timelineIconInner} />
                        ) : (
                          <div className={styles.timelineIconDot}></div>
                        )}
                      </div>
                      <div className={styles.timelineDetails}>
                        <h4
                          className={`${styles.timelineName} ${
                            order.status === 'delivered'
                              ? styles.completed
                              : styles.pending
                          }`}
                        >
                          Order Delivered
                        </h4>
                        <p className={styles.timelineDescription}>
                          Your order has been successfully delivered.
                        </p>
                      </div>
                      <div className={styles.timelineDate}>
                        <p className={styles.timelineDateMain}>-</p>
                        <p className={styles.timelineDateSub}>-</p>
                      </div>
                    </div>
                  </li>
                )}

                {order.status === 'cancelled' && (
                  <li className={styles.timelineItem}>
                    <div className={styles.timelineContent}>
                      <div
                        className={`${styles.timelineIcon} ${styles.cancelled}`}
                      >
                        <XCircle className={styles.timelineIconInner} />
                      </div>
                      <div className={styles.timelineDetails}>
                        <h4
                          className={`${styles.timelineName} ${styles.completed}`}
                        >
                          Order Cancelled
                        </h4>
                        <p className={styles.timelineDescription}>
                          This order has been cancelled.
                        </p>
                      </div>
                      <div className={styles.timelineDate}>
                        <p className={styles.timelineDateMain}>-</p>
                        <p className={styles.timelineDateSub}>-</p>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Payment Summary Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <CreditCard className={styles.sectionIcon} />
                Payment Summary
              </h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.paymentGrid}>
                <div className={styles.paymentMethodSection}>
                  <h3>Payment Method</h3>
                  <div className={styles.paymentMethodCard}>
                    <CreditCard className={styles.paymentIcon} />
                    <div className={styles.paymentMethodDetails}>
                      <h4 className={styles.paymentMethodName}>
                        {order.paymentMethod}
                      </h4>
                      <p className={styles.paymentStatus}>Payment Completed</p>
                    </div>
                  </div>
                </div>

                <div className={styles.pricingBreakdown}>
                  <h3>Order Summary</h3>
                  <div className={styles.pricingRow}>
                    <span className={styles.pricingLabel}>Subtotal</span>
                    <span className={styles.pricingValue}>
                      ${order?.subTotal?.toFixed(2)}
                    </span>
                  </div>
                  {(order.shippingCost || 0) > 0 && (
                    <div className={styles.pricingRow}>
                      <span className={styles.pricingLabel}>Shipping</span>
                      <span className={styles.pricingValue}>
                        ${(order.shippingCost || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {(order.discount || 0) > 0 && (
                    <div
                      className={`${styles.pricingRow} ${styles.discountRow}`}
                    >
                      <span className={styles.pricingLabel}>Discount</span>
                      <span className={styles.pricingValue}>
                        -${(order.discount || 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {order.firstTimeDiscount?.isApplied && (
                    <div className={styles.pricingRow}>
                      <span className={styles.pricingLabel}>
                        First-time Discount
                      </span>
                      <span className={styles.pricingValue}>
                        -${order.firstTimeDiscount.amount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className={`${styles.pricingRow} ${styles.totalRow}`}>
                    <span className={styles.pricingLabel}>Total</span>
                    <span className={styles.pricingValue}>
                      ${order.totalAmount.toFixed(2)}
                    </span>
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
          className={styles.modalOverlay}
          onClick={() => setShowRefundModal(false)}
        >
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Process Refund</h3>
              <button
                onClick={() => setShowRefundModal(false)}
                className={styles.closeButton}
              >
                <XCircle className={styles.closeIcon} />
              </button>
            </div>
            <form onSubmit={handleRefund}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label htmlFor="refundAmount">Refund Amount ($)</label>
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
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="refundReason">Reason</label>
                  <select
                    id="refundReason"
                    value={refundReason}
                    onChange={e => setRefundReason(e.target.value)}
                    className={styles.select}
                  >
                    <option value="requested_by_customer">
                      Requested by Customer
                    </option>
                    <option value="duplicate">Duplicate Charge</option>
                    <option value="fraudulent">Fraudulent</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className={styles.cancelModalButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRefunding || !refundAmount}
                  className={styles.confirmRefundButton}
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
          className={styles.modalOverlay}
          onClick={() => setShowCancelModal(false)}
        >
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Cancel Order</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className={styles.closeButton}
              >
                <XCircle className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.cancelWarning}>
                <AlertCircle className={styles.warningIcon} />
                <p>
                  Are you sure you want to cancel this order?
                  {order.paymentMethod === 'Card' &&
                    ' A full refund will be processed automatically.'}
                  This action cannot be undone.
                </p>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="cancelReason">Cancellation Reason</label>
                <select
                  id="cancelReason"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className={styles.select}
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
            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className={styles.cancelModalButton}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className={styles.confirmCancelButton}
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
