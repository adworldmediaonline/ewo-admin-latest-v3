'use client';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
// internal
// import OrderActions from './order-actions';
import { Search } from '@/svg';
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

// Simple icon components for missing SVG icons
const Filter = ({ className }: { className?: string }) => (
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
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

const Export = ({ className }: { className?: string }) => (
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

const Calendar = ({ className }: { className?: string }) => (
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
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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

// Pagination Navigation Icons
const ChevronLeft = ({ className }: { className?: string }) => (
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

const ChevronRight = ({ className }: { className?: string }) => (
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
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const ChevronsLeft = ({ className }: { className?: string }) => (
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
      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
    />
  </svg>
);

const ChevronsRight = ({ className }: { className?: string }) => (
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
      d="M13 5l7 7-7 7M5 5l7 7-7 7"
    />
  </svg>
);

const OrderTable = () => {
  const { data: orders, isError, isLoading, error } = useGetAllOrdersQuery();
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
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusClass = (status: string) => {
      switch (status.toLowerCase()) {
        case 'pending':
          return `${styles.statusBadge} ${styles.statusPending}`;
        case 'processing':
          return `${styles.statusBadge} ${styles.statusProcessing}`;
        case 'shipped':
          return `${styles.statusBadge} ${styles.statusShipped}`;
        case 'delivered':
          return `${styles.statusBadge} ${styles.statusDelivered}`;
        case 'cancel':
        case 'cancelled':
          return `${styles.statusBadge} ${styles.statusCancel}`;
        default:
          return `${styles.statusBadge} ${styles.statusDefault}`;
      }
    };

    return (
      <span className={getStatusClass(status)}>
        <span className={styles.statusDot}></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Customer info component
  const CustomerInfo = ({ order }: { order: any }) => (
    <div className={styles.customerInfo}>
      <div className={styles.customerAvatar}>
        {order.user?.imageURL ? (
          <Image
            className={styles.avatarImage}
            src={order.user.imageURL}
            alt="customer"
            width={48}
            height={48}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            <User className={styles.avatarIcon} />
          </div>
        )}
      </div>
      <div className={styles.customerDetails}>
        <p className={styles.customerName}>
          {order.isGuestOrder ? order.name : order.user?.name || order.name}
        </p>
        {/* <p className={styles.customerEmail}>{order.email}</p>
        {order.isGuestOrder && <span className={styles.guestBadge}>Guest</span>} */}
      </div>
    </div>
  );

  // Payment method badge
  const PaymentBadge = ({ method }: { method: string }) => (
    <span className={styles.paymentBadge}>
      <CreditCard className={styles.paymentIcon} />
      {method}
    </span>
  );

  // TanStack Table columns
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={table.getIsAllRowsSelected?.()}
            onChange={table.getToggleAllRowsSelectedHandler?.()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className={styles.checkbox}
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
          <span className={styles.orderId}>
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
          <div className={styles.itemsInfo}>
            <div className={styles.itemsCount}>
              {info.row.original.cart.reduce(
                (acc: number, curr: { orderQuantity: number }) =>
                  acc + curr.orderQuantity,
                0
              )}{' '}
              items
            </div>
            <div className={styles.totalAmount}>
              ${info.row.original.totalAmount.toFixed(2)}
            </div>
            {info.row.original.discount > 0 && (
              <div className={styles.discount}>
                Discount: -${info.row.original.discount.toFixed(2)}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Payment',
        cell: info => <PaymentBadge method={info.row.original.paymentMethod} />,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => (
          <div className={styles.statusContainer}>
            <StatusBadge status={info.row.original.status} />
            {/* <div className={styles.statusChangeContainer}>
              <OrderStatusChange id={info.row.original._id} />
            </div> */}
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: info => (
          <div className={styles.dateContainer}>
            <div className={styles.dateMain}>
              {dayjs(info.row.original.createdAt).format('MMM D, YYYY')}
            </div>
            <div className={styles.dateTime}>
              {dayjs(info.row.original.createdAt).format('h:mm A')}
            </div>
          </div>
        ),
      },
      {
        id: 'shipping',
        header: 'Shipping',
        cell: info => (
          <div className={styles.shippingContainer}>
            <ShippingActions order={info.row.original} />
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <div className={styles.actionsContainer}>
            <Link
              href={`/order-details/${info.row.original._id}`}
              className={styles.viewButton}
            >
              View
            </Link>
            {/* <OrderActions
              id={info.row.original._id}
              cls={styles.inlineActions}
              inline={true}
            /> */}
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
        'Tracking Number',
        'Carrier',
      ].join(','),
      ...filteredOrders.map(order =>
        [
          order.orderId || '',
          order.invoice,
          order.name,
          order.email,
          order.totalAmount,
          order.status,
          order.paymentMethod,
          dayjs(order.createdAt).format('YYYY-MM-DD HH:mm'),
          order.status === 'shipped' ? 'Shipped' : 'Not Shipped',
          order.shippingDetails?.trackingNumber || '',
          order.shippingDetails?.carrier || '',
        ].join(',')
      ),
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
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <span className={styles.loadingText}>Loading orders...</span>
      </div>
    );
  } else if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error loading orders" />;
  } else if (!isLoading && !isError && filteredOrders.length === 0) {
    content = <ErrorMsg msg="No Orders Found" />;
  } else {
    content = (
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className={styles.headerCell}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                className={`${styles.tableRow} ${
                  idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
                }`}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className={styles.tableCell}>
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
    <div className={styles.container}>
      {/* Search Bar and Export */}
      <div className={styles.header}>
        <div className={styles.searchContainer}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by order ID, customer name, email, or phone..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
          />
          <div className={styles.searchIcon}>
            <Search />
          </div>
        </div>
        <button onClick={handleExport} className={styles.exportButton}>
          Export CSV
        </button>
      </div>
      <div className={styles.content}>{content}</div>
      {/* TanStack Table Built-in Pagination */}
      {filteredOrders.length > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            <span className={styles.paginationText}>
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
                <span className={styles.paginationFiltered}>
                  {' '}
                  (filtered from {orders?.data?.length} total)
                </span>
              )}
            </span>

            <div className={styles.pageSizeSelector}>
              <span>Show:</span>
              <select
                className={styles.pageSizeSelect}
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

          <div className={styles.paginationControls}>
            <button
              className={`${styles.paginationButton} ${styles.paginationButtonIcon}`}
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className={styles.paginationIcon} />
            </button>

            <button
              className={`${styles.paginationButton} ${styles.paginationButtonIcon}`}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className={styles.paginationIcon} />
            </button>

            <div className={styles.pageNumbers}>
              {Array.from(
                { length: Math.min(5, table.getPageCount()) },
                (_, i) => {
                  const currentPage = table.getState().pagination.pageIndex;
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
                      className={`${styles.paginationButton} ${
                        pageIndex === currentPage
                          ? styles.paginationButtonActive
                          : ''
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
              className={`${styles.paginationButton} ${styles.paginationButtonIcon}`}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className={styles.paginationIcon} />
            </button>

            <button
              className={`${styles.paginationButton} ${styles.paginationButtonIcon}`}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className={styles.paginationIcon} />
            </button>
          </div>

          <div className={styles.pageJump}>
            <span>Go to page:</span>
            <input
              type="number"
              className={styles.pageJumpInput}
              min={1}
              max={table.getPageCount()}
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTable;
