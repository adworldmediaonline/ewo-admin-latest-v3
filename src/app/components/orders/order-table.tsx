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
import { useGetAllOrdersQuery } from '@/redux/order/orderApi';
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
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Download,
  Eye,
  Package,
  RefreshCw,
  Search,
  Truck,
  User,
  XCircle,
} from 'lucide-react';

const OrderTable = ({ role }: { role: 'admin' | 'super-admin' }) => {
  const { data: orders, isError, isLoading, error, refetch, isFetching } = useGetAllOrdersQuery(undefined, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const [searchVal, setSearchVal] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Filtering logic
  const filteredOrders = useMemo(() => {
    if (!orders?.data) return [];
    return orders.data.filter(order => {
      const matchesSearch =
        !searchVal ||
        order.orderId?.toLowerCase().includes(searchVal.toLowerCase()) ||
        order.invoice.toString().includes(searchVal) ||
        order.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        order.email.toLowerCase().includes(searchVal.toLowerCase()) ||
        order.contact.includes(searchVal);
      return matchesSearch;
    });
  }, [orders?.data, searchVal]);

  // Reset pagination when search changes
  React.useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [searchVal]);

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

  // TanStack Table instance with built-in pagination
  const table = useReactTable({
    data: filteredOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    manualPagination: false,
  });

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      [
        'Order ID',
        'Invoice',
        'Customer',
        'Email',
        'Total',
        'Status',
        'Payment Method',
        'Date',
        'Shipping Status',
        'Carriers & Tracking Numbers',
      ].join(','),
      ...filteredOrders.map(order => {
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

        return [
          order.orderId || '',
          order.invoice,
          order.name,
          order.email,
          order.totalAmount,
          order.status,
          order.paymentMethod,
          dayjs(order.createdAt).format('YYYY-MM-DD HH:mm'),
          order.status === 'shipped' ? 'Shipped' : 'Not Shipped',
          carriersInfo,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                className="w-full px-4 py-2 pr-10 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                type="text"
                placeholder="Search by order ID, customer name, email, or phone..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Search className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                    of {filteredOrders.length} orders
                    {filteredOrders.length !== orders?.data?.length && (
                      <span className="text-primary font-medium">
                        {' '}
                        (filtered from {orders?.data?.length} total)
                      </span>
                    )}
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
        </div>
      </div>
    </div>
  );
};

export default OrderTable;
