'use client';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
// internal
// import OrderActions from './order-actions';
import ErrorMsg from '../common/error-msg';
import ShippingActions from './shipping-actions';
// import OrderStatusChange from './status-change';
import { useGetAllOrdersQuery, authApi } from '@/redux/order/orderApi';
import { store } from '@/redux/store';
import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Download,
  Eye,
  Package,
  Plus,
  RefreshCw,
  Search,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const OrderTable = ({ role }: { role: 'admin' | 'super-admin' }) => {
  const [searchVal, setSearchVal] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);
  const [isDownloadingByDateRange, setIsDownloadingByDateRange] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Debounce search to avoid too many API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchVal.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchVal]);

  // Reset pagination when search or date range changes
  React.useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch, dateRange]);

  // Format date range for API (only if super-admin)
  const startDate = role === 'super-admin' && dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
  const endDate = role === 'super-admin' && dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

  // Fetch orders with server-side pagination
  const { data: orders, isError, isLoading, error, refetch, isFetching } = useGetAllOrdersQuery(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearch,
      startDate: startDate,
      endDate: endDate,
    },
    {
      pollingInterval: 60000, // Auto-refresh every 60 seconds (reduced frequency)
      refetchOnMountOrArgChange: false, // Don't refetch on mount if data exists
      refetchOnFocus: false, // Don't refetch on window focus (reduces unnecessary queries)
      refetchOnReconnect: true, // Only refetch on reconnect
    }
  );

  const filteredOrders = orders?.data || [];
  const totalOrders = orders?.pagination?.total || 0;
  const totalPages = orders?.pagination?.pages || 0;

  // Status badge component
  const StatusBadge = ({ status, order }: { status: string; order: any }) => {
    const getStatusStyles = (status: string) => {
      switch (status.toLowerCase()) {
        case 'pending':
          return {
            bg: 'bg-yellow-100 dark:bg-yellow-950/20',
            text: 'text-yellow-800 dark:text-yellow-200',
            icon: <Clock className="w-3 h-3 mr-1" />,
          };
        case 'processing':
          return {
            bg: 'bg-blue-100 dark:bg-blue-950/20',
            text: 'text-blue-800 dark:text-blue-200',
            icon: <Package className="w-3 h-3 mr-1" />,
          };
        case 'shipped':
          return {
            bg: 'bg-purple-100 dark:bg-purple-950/20',
            text: 'text-purple-800 dark:text-purple-200',
            icon: <Truck className="w-3 h-3 mr-1" />,
          };
        case 'delivered':
          return {
            bg: 'bg-green-100 dark:bg-green-950/20',
            text: 'text-green-800 dark:text-green-200',
            icon: <CheckCircle className="w-3 h-3 mr-1" />,
          };
        case 'cancel':
        case 'cancelled':
          return {
            bg: 'bg-red-100 dark:bg-red-950/20',
            text: 'text-red-800 dark:text-red-200',
            icon: <XCircle className="w-3 h-3 mr-1" />,
          };
        default:
          return {
            bg: 'bg-gray-100 dark:bg-gray-950/20',
            text: 'text-gray-800 dark:text-gray-200',
            icon: null,
          };
      }
    };

    const { bg, text, icon } = getStatusStyles(status);

    // Support both new (multiple carriers) and legacy (single carrier) formats
    const shippingCarriers = order.shippingDetails?.carriers && Array.isArray(order.shippingDetails.carriers) && order.shippingDetails.carriers.length > 0
      ? order.shippingDetails.carriers
      : order.shippingDetails?.carrier
        ? [{
          carrier: order.shippingDetails.carrier,
          trackingNumber: order.shippingDetails.trackingNumber,
          trackingUrl: order.shippingDetails.trackingUrl,
        }]
        : [];

    return (
      <div className="flex flex-col gap-1 min-w-0">
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition-colors duration-150 ${bg} ${text}`}
          tabIndex={0}
          aria-label={`Order status: ${status}`}
          role="status"
        >
          {icon}
          <span className="ml-1">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </span>
        {shippingCarriers.length > 0 && (
          <div className="flex flex-col gap-1 mt-1">
            {shippingCarriers.map((carrierItem: any, index: number) => (
              <div key={index} className="flex flex-wrap gap-1">
                {carrierItem.carrier && (
                  <span
                    className="text-xs text-gray-600 bg-gray-50 dark:bg-gray-900/30 px-1.5 py-0.5 rounded"
                    aria-label={`Carrier ${index + 1}: ${carrierItem.carrier}`}
                    tabIndex={0}
                  >
                    {carrierItem.carrier}
                  </span>
                )}
                {carrierItem.trackingNumber && (
                  <span
                    className="text-xs text-gray-600 font-mono bg-gray-50 dark:bg-gray-900/30 px-1.5 py-0.5 rounded"
                    aria-label={`Tracking number ${index + 1}: ${carrierItem.trackingNumber}`}
                    tabIndex={0}
                  >
                    {carrierItem.trackingNumber}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Customer info component
  const CustomerInfo = ({ order }: { order: any }) => (
    <div className="flex items-center space-x-3">
      <div className="shrink-0">
        {order.user?.imageURL ? (
          <Image
            className="w-10 h-10 rounded-full object-cover border border-border"
            src={order.user.imageURL}
            alt="customer"
            width={40}
            height={40}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {order.isGuestOrder ? order.name : order.user?.name || order.name}
        </p>
        {order.isGuestOrder && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-200 rounded-full">
            Guest
          </span>
        )}
      </div>
    </div>
  );

  // TanStack Table columns
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            checked={table.getIsAllRowsSelected?.()}
            onChange={table.getToggleAllRowsSelectedHandler?.()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            checked={!!selectedRows[row.original._id]}
            onChange={e => {
              setSelectedRows(prev => ({
                ...prev,
                [row.original._id]: e.target.checked,
              }));
            }}
          />
        ),
        size: 48,
      },
      {
        accessorKey: 'orderId',
        header: 'Order ID',
        cell: info => (
          <span className="font-medium text-foreground">
            #{info.row.original.orderId || info.row.original.invoice}
          </span>
        ),
      },
      {
        accessorKey: 'customer',
        header: 'Customer',
        cell: info => <CustomerInfo order={info.row.original} />,
      },
      {
        accessorKey: 'items',
        header: 'Items & Total',
        cell: info => (
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {info.row.original.cart.reduce(
                (acc: number, curr: { orderQuantity: number }) =>
                  acc + curr.orderQuantity,
                0
              )}{' '}
              items
            </div>
            <div className="text-sm font-semibold text-foreground">
              ${info.row.original.totalAmount.toFixed(2)}
            </div>
            {info.row.original.discount > 0 && (
              <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                -${info.row.original.discount.toFixed(2)}
              </div>
            )}
          </div>
        ),
      },

      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => (
          <div className="flex flex-col space-y-1">
            <StatusBadge
              status={info.row.original.status}
              order={info.row.original}
            />
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: info => (
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">
              {dayjs(info.row.original.createdAt).format('MMM D, YYYY')}
            </div>
            <div className="text-xs text-muted-foreground">
              {dayjs(info.row.original.createdAt).format('h:mm A')}
            </div>
          </div>
        ),
      },
      {
        id: 'shipping',
        header: 'Shipping',
        cell: info => (
          <div className="flex items-center">
            <ShippingActions order={info.row.original} />
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <div className="flex items-center space-x-2">
            <Link
              href={`/dashboard/${role}/order-details/${info.row.original._id}`}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors duration-200"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Link>
          </div>
        ),
      },
    ],
    [selectedRows]
  );

  // TanStack Table instance with server-side pagination
  const table = useReactTable({
    data: filteredOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    // Enable server-side pagination
    manualPagination: true,
    pageCount: totalPages,
  });

  // Export functionality
  const handleExport = () => {
    // Helper function to escape CSV values
    const escapeCsvValue = (value: any): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // If value contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvRows: string[] = [];
    
    // CSV Header
    csvRows.push([
      'Order Object ID',
      'Order ID',
      'Invoice',
      'Customer',
      'Email',
      'Product SKU',
      'Product Title',
      'Quantity',
      'Product Price',
      'Subtotal',
      'Shipping Cost',
      'Tax',
      'Discount',
      'Total',
      'Status',
      'Payment Method',
      'Date',
      'Shipping Status',
      'Carriers & Tracking Numbers',
    ].join(','));

    // Process each order and create rows for each cart item
    filteredOrders.forEach(order => {
      // Support both new (multiple carriers) and legacy (single carrier) formats
      const shippingCarriers = order.shippingDetails?.carriers && Array.isArray(order.shippingDetails.carriers) && order.shippingDetails.carriers.length > 0
        ? order.shippingDetails.carriers
        : order.shippingDetails?.carrier
          ? [{
            carrier: order.shippingDetails.carrier,
            trackingNumber: order.shippingDetails.trackingNumber,
            trackingUrl: order.shippingDetails.trackingUrl,
          }]
          : [];

      const carriersInfo = shippingCarriers.length > 0
        ? shippingCarriers.map((c: any) => `${c.carrier || ''}: ${c.trackingNumber || 'N/A'}`).join('; ')
        : '';

      // Common order fields
      const orderId = escapeCsvValue(order._id);
      const orderNumber = escapeCsvValue(order.orderId || '');
      const invoice = escapeCsvValue(order.invoice);
      const customer = escapeCsvValue(order.name);
      const email = escapeCsvValue(order.email);
      const total = escapeCsvValue(order.totalAmount);
      const status = escapeCsvValue(order.status);
      const paymentMethod = escapeCsvValue(order.paymentMethod);
      const date = escapeCsvValue(dayjs(order.createdAt).format('YYYY-MM-DD HH:mm'));
      const shippingStatus = escapeCsvValue(order.status === 'shipped' ? 'Shipped' : 'Not Shipped');
      const carriers = escapeCsvValue(carriersInfo);
      const subtotal = escapeCsvValue(order.subTotal || 0);
      const shippingCost = escapeCsvValue(order.shippingCost || 0);
      const tax = escapeCsvValue(order.tax || 0);
      const discount = escapeCsvValue(order.discount || 0);

      // If order has cart items, create a row for each product
      if (order.cart && Array.isArray(order.cart) && order.cart.length > 0) {
        order.cart.forEach((cartItem: any) => {
          const sku = escapeCsvValue(cartItem.sku || cartItem.SKU || '');
          const productTitle = escapeCsvValue(cartItem.title || cartItem.name || '');
          const quantity = escapeCsvValue(cartItem.orderQuantity || cartItem.quantity || 1);
          const productPrice = escapeCsvValue(cartItem.price || cartItem.finalPriceDiscount || 0);
          
          csvRows.push([
            orderId,
            orderNumber,
            invoice,
            customer,
            email,
            sku,
            productTitle,
            quantity,
            productPrice,
            subtotal,
            shippingCost,
            tax,
            discount,
            total,
            status,
            paymentMethod,
            date,
            shippingStatus,
            carriers,
          ].join(','));
        });
      } else {
        // If no cart items, still create one row with order info
        csvRows.push([
          orderId,
          orderNumber,
          invoice,
          customer,
          email,
          '', // SKU
          '', // Product Title
          '', // Quantity
          '', // Product Price
          subtotal,
          shippingCost,
          tax,
          discount,
          total,
          status,
          paymentMethod,
          date,
          shippingStatus,
          carriers,
        ].join(','));
      }
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Download orders by date range functionality
  const handleDownloadByDateRange = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      alert('Please select a date range first');
      return;
    }

    setIsDownloadingByDateRange(true);
    try {
      const allOrders: any[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      const pageSize = 100; // Fetch 100 orders per page for efficiency

      // Get date range values
      const downloadStartDate = format(dateRange.from, 'yyyy-MM-dd');
      const downloadEndDate = format(dateRange.to, 'yyyy-MM-dd');

      // Fetch all pages of orders within date range
      while (hasMorePages) {
        const result = await store.dispatch(
          authApi.endpoints.getAllOrders.initiate({
            page: currentPage,
            limit: pageSize,
            search: '', // Ignore search filters for date range download
            status: '', // Ignore status filters for date range download
            startDate: downloadStartDate,
            endDate: downloadEndDate,
          })
        );

        if (result.data?.data) {
          allOrders.push(...result.data.data);
          
          // Check if there are more pages
          const totalPages = result.data.pagination?.pages || 0;
          hasMorePages = currentPage < totalPages;
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }

      // Generate CSV from all orders
      const escapeCsvValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const csvRows: string[] = [];
      
      // CSV Header
      csvRows.push([
        'Order Object ID',
        'Order ID',
        'Invoice',
        'Customer',
        'Email',
        'Product SKU',
        'Product Title',
        'Quantity',
        'Product Price',
        'Subtotal',
        'Shipping Cost',
        'Tax',
        'Discount',
        'Total Amount',
        'Status',
        'Payment Method',
        'Created At',
      ].join(','));

      // CSV Rows - Expand cart items
      allOrders.forEach(order => {
        if (order.cart && Array.isArray(order.cart) && order.cart.length > 0) {
          order.cart.forEach((item: any) => {
            csvRows.push([
              escapeCsvValue(order._id),
              escapeCsvValue(order.orderId),
              escapeCsvValue(order.invoice),
              escapeCsvValue(order.name),
              escapeCsvValue(order.email),
              escapeCsvValue(item.sku || ''),
              escapeCsvValue(item.title || ''),
              escapeCsvValue(item.orderQuantity || 1),
              escapeCsvValue(item.finalPriceDiscount || item.price || 0),
              escapeCsvValue(order.subTotal || 0),
              escapeCsvValue(order.shippingCost || 0),
              escapeCsvValue(order.tax || 0),
              escapeCsvValue(order.discount || 0),
              escapeCsvValue(order.totalAmount || 0),
              escapeCsvValue(order.status),
              escapeCsvValue(order.paymentMethod),
              escapeCsvValue(dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss')),
            ].join(','));
          });
        } else {
          // If no cart items, still add a row with order info
          csvRows.push([
            escapeCsvValue(order._id),
            escapeCsvValue(order.orderId),
            escapeCsvValue(order.invoice),
            escapeCsvValue(order.name),
            escapeCsvValue(order.email),
            '',
            '',
            '',
            '',
            escapeCsvValue(order.subTotal || 0),
            escapeCsvValue(order.shippingCost || 0),
            escapeCsvValue(order.tax || 0),
            escapeCsvValue(order.discount || 0),
            escapeCsvValue(order.totalAmount || 0),
            escapeCsvValue(order.status),
            escapeCsvValue(order.paymentMethod),
            escapeCsvValue(dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss')),
          ].join(','));
        }
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateRangeStr = `${downloadStartDate}_to_${downloadEndDate}`;
      a.download = `orders-${dateRangeStr}-${dayjs().format('YYYY-MM-DD')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading orders by date range:', error);
      alert('Failed to download orders. Please try again.');
    } finally {
      setIsDownloadingByDateRange(false);
    }
  };

  // Download all orders functionality (ignores all filters including date range)
  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      const allOrders: any[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      const pageSize = 100; // Fetch 100 orders per page for efficiency

      // Fetch all pages of orders (no filters)
      while (hasMorePages) {
        const result = await store.dispatch(
          authApi.endpoints.getAllOrders.initiate({
            page: currentPage,
            limit: pageSize,
            search: '', // Download All ignores search filters
            status: '', // Download All ignores status filters
            startDate: '', // Download All ignores date range filters
            endDate: '', // Download All ignores date range filters
          })
        );

        if (result.data?.data) {
          allOrders.push(...result.data.data);
          
          // Check if there are more pages
          const totalPages = result.data.pagination?.pages || 0;
          hasMorePages = currentPage < totalPages;
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }

      // Generate CSV from all orders
      const escapeCsvValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const csvRows: string[] = [];
      
      // CSV Header
      csvRows.push([
        'Order Object ID',
        'Order ID',
        'Invoice',
        'Customer',
        'Email',
        'Product SKU',
        'Product Title',
        'Quantity',
        'Product Price',
        'Subtotal',
        'Shipping Cost',
        'Tax',
        'Discount',
        'Total',
        'Status',
        'Payment Method',
        'Date',
        'Shipping Status',
        'Carriers & Tracking Numbers',
      ].join(','));

      // Process each order and create rows for each cart item
      allOrders.forEach(order => {
        const shippingCarriers = order.shippingDetails?.carriers && Array.isArray(order.shippingDetails.carriers) && order.shippingDetails.carriers.length > 0
          ? order.shippingDetails.carriers
          : order.shippingDetails?.carrier
            ? [{
              carrier: order.shippingDetails.carrier,
              trackingNumber: order.shippingDetails.trackingNumber,
              trackingUrl: order.shippingDetails.trackingUrl,
            }]
            : [];

        const carriersInfo = shippingCarriers.length > 0
          ? shippingCarriers.map((c: any) => `${c.carrier || ''}: ${c.trackingNumber || 'N/A'}`).join('; ')
          : '';

        const orderId = escapeCsvValue(order._id);
        const orderNumber = escapeCsvValue(order.orderId || '');
        const invoice = escapeCsvValue(order.invoice);
        const customer = escapeCsvValue(order.name);
        const email = escapeCsvValue(order.email);
        const total = escapeCsvValue(order.totalAmount);
        const status = escapeCsvValue(order.status);
        const paymentMethod = escapeCsvValue(order.paymentMethod);
        const date = escapeCsvValue(dayjs(order.createdAt).format('YYYY-MM-DD HH:mm'));
        const shippingStatus = escapeCsvValue(order.status === 'shipped' ? 'Shipped' : 'Not Shipped');
        const carriers = escapeCsvValue(carriersInfo);
        const subtotal = escapeCsvValue(order.subTotal || 0);
        const shippingCost = escapeCsvValue(order.shippingCost || 0);
        const tax = escapeCsvValue(order.tax || 0);
        const discount = escapeCsvValue(order.discount || 0);

        if (order.cart && Array.isArray(order.cart) && order.cart.length > 0) {
          order.cart.forEach((cartItem: any) => {
            const sku = escapeCsvValue(cartItem.sku || cartItem.SKU || '');
            const productTitle = escapeCsvValue(cartItem.title || cartItem.name || '');
            const quantity = escapeCsvValue(cartItem.orderQuantity || cartItem.quantity || 1);
            const productPrice = escapeCsvValue(cartItem.price || cartItem.finalPriceDiscount || 0);
            
            csvRows.push([
              orderId,
              orderNumber,
              invoice,
              customer,
              email,
              sku,
              productTitle,
              quantity,
              productPrice,
              subtotal,
              shippingCost,
              tax,
              discount,
              total,
              status,
              paymentMethod,
              date,
              shippingStatus,
              carriers,
            ].join(','));
          });
        } else {
          csvRows.push([
            orderId,
            orderNumber,
            invoice,
            customer,
            email,
            '',
            '',
            '',
            '',
            subtotal,
            shippingCost,
            tax,
            discount,
            total,
            status,
            paymentMethod,
            date,
            shippingStatus,
            carriers,
          ].join(','));
        }
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-orders-${dayjs().format('YYYY-MM-DD')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading all orders:', error);
      alert('Failed to download all orders. Please try again.');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  let content = null;
  if (isLoading) {
    content = (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <span className="text-muted-foreground">Loading orders...</span>
      </div>
    );
  } else if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error loading orders" />;
  } else if (!isLoading && !isError && filteredOrders.length === 0) {
    content = <ErrorMsg msg="No Orders Found" />;
  } else {
    content = (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                className={`hover:bg-muted/50 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                  }`}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar, Refresh, and Export */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Top Row: Search and Date Range */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1 max-w-md">
                <input
                  className="w-full px-4 py-2 pr-10 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  type="text"
                  placeholder="Search by order ID, customer name, email, or phone..."
                  value={searchVal}
                  onChange={e => {
                    setSearchVal(e.target.value);
                    // Reset to first page when searching
                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                  }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Search className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>


              {/* Date Range Picker - Super Admin Only */}
              {role === 'super-admin' && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-[300px] justify-start text-left font-normal',
                          !dateRange && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, 'LLL dd, y')} -{' '}
                              {format(dateRange.to, 'LLL dd, y')}
                            </>
                          ) : (
                            format(dateRange.from, 'LLL dd, y')
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Quick Date Filters */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        setDateRange({
                          from: firstDayOfMonth,
                          to: today,
                        });
                        setPagination(prev => ({ ...prev, pageIndex: 0 }));
                      }}
                    >
                      This Month
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                        setDateRange({
                          from: firstDayOfLastMonth,
                          to: lastDayOfLastMonth,
                        });
                        setPagination(prev => ({ ...prev, pageIndex: 0 }));
                      }}
                    >
                      Last Month
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateRange(undefined);
                        setPagination(prev => ({ ...prev, pageIndex: 0 }));
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row: Action Buttons */}
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/admin/orders/create"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Link>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh orders"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              {role === 'super-admin' && (
                <>
                  <button
                    onClick={handleDownloadByDateRange}
                    disabled={isDownloadingByDateRange || !dateRange?.from || !dateRange?.to}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!dateRange?.from || !dateRange?.to ? 'Please select a date range first' : 'Download all orders within the selected date range'}
                  >
                    {isDownloadingByDateRange ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Download by Date Range
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadAll}
                    disabled={isDownloadingAll}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download all orders (ignores all filters)"
                  >
                    {isDownloadingAll ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Auto-refresh indicator */}
          {isFetching && !isLoading && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Updating orders...</span>
            </div>
          )}
        </div>

        {/* Table Container */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6">{content}</div>

          {/* TanStack Table Built-in Pagination */}
          {filteredOrders.length > 0 && (
            <div className="px-6 py-4 border-t border-border bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Pagination Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Showing{' '}
                    {table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                      1}{' '}
                    to{' '}
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                      filteredOrders.length
                    )}{' '}
                    of {totalOrders} orders
                  </span>

                  {/* Page Size Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show:</span>
                    <select
                      className="px-3 py-1 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      value={table.getState().pagination.pageSize}
                      onChange={e => {
                        table.setPageSize(Number(e.target.value));
                      }}
                    >
                      {[5, 10, 20, 30, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                          {pageSize}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1">
                  <button
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  <button
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from(
                      { length: Math.min(5, table.getPageCount()) },
                      (_, i) => {
                        const currentPage =
                          table.getState().pagination.pageIndex;
                        const totalPages = table.getPageCount();

                        let startPage = Math.max(0, currentPage - 2);
                        let endPage = Math.min(totalPages - 1, startPage + 4);

                        if (endPage - startPage < 4) {
                          startPage = Math.max(0, endPage - 4);
                        }

                        const pageIndex = startPage + i;

                        if (pageIndex >= totalPages) return null;

                        return (
                          <button
                            key={pageIndex}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${pageIndex === currentPage
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-background'
                              }`}
                            onClick={() => table.setPageIndex(pageIndex)}
                          >
                            {pageIndex + 1}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Page Jump */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Go to page:
                  </span>
                  <input
                    type="number"
                    className="w-16 px-2 py-1 text-sm text-center border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    min={1}
                    max={table.getPageCount()}
                    defaultValue={table.getState().pagination.pageIndex + 1}
                    onChange={e => {
                      const page = e.target.value
                        ? Number(e.target.value) - 1
                        : 0;
                      table.setPageIndex(page);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Download Buttons at Bottom - Super Admin Only */}
          {role === 'super-admin' && (
            <div className="px-6 py-4 border-t border-border bg-muted/20">
              <div className="flex justify-center gap-2 flex-wrap">
                <button
                  onClick={handleDownloadByDateRange}
                  disabled={isDownloadingByDateRange || !dateRange?.from || !dateRange?.to}
                  className="inline-flex items-center px-6 py-3 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!dateRange?.from || !dateRange?.to ? 'Please select a date range first' : 'Download all orders within the selected date range'}
                >
                  {isDownloadingByDateRange ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Download by Date Range
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloadingAll}
                  className="inline-flex items-center px-6 py-3 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download all orders (ignores all filters)"
                >
                  {isDownloadingAll ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Downloading All Orders...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download All Orders
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTable;
