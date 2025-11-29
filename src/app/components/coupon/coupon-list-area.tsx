'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAllCouponsQuery, useDeleteCouponMutation } from '@/redux/coupon/couponApi';
import { ICoupon } from '@/types/coupon';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ChevronDown,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Tag,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { notifyError } from '@/utils/toast';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export default function CouponListArea() {
  const { data: coupons = [], isError, isLoading } = useGetAllCouponsQuery();
  const [deleteCoupon] = useDeleteCouponMutation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const handleDelete = useCallback(async (id: string, title: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete coupon "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteCoupon(id);
          if ('data' in res && res.data && res.data.success) {
            Swal.fire('Deleted!', res.data.message || 'Coupon deleted successfully.', 'success');
          } else {
            Swal.fire('Error!', 'Failed to delete coupon', 'error');
          }
        } catch (error) {
          notifyError('Failed to delete coupon');
        }
      }
    });
  }, [deleteCoupon]);

  // Format discount display
  const formatDiscount = (coupon: ICoupon): string => {
    switch (coupon.discountType) {
      case 'percentage':
        return `${coupon.discountPercentage}%`;
      case 'fixed_amount':
        return `$${coupon.discountAmount}`;
      case 'buy_x_get_y':
        return `Buy ${coupon.buyQuantity} Get ${coupon.getQuantity}`;
      case 'free_shipping':
        return 'Free Shipping';
      default:
        return 'N/A';
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: ICoupon['status'] }) => {
    const statusConfig = {
      active: { label: 'Active', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
      expired: { label: 'Expired', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
      exhausted: { label: 'Exhausted', className: 'bg-orange-100 text-orange-800 hover:bg-orange-100' },
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
      <Badge variant="secondary" className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  // Global filter function for searching
  const globalFilterFn = useMemo(
    () => (row: any, columnId: string, filterValue: string) => {
      if (!filterValue) return true;

      const coupon = row.original;
      const searchValue = filterValue.toLowerCase();

      const titleMatch = coupon.title?.toLowerCase().includes(searchValue);
      const codeMatch = coupon.couponCode?.toLowerCase().includes(searchValue);

      return titleMatch || codeMatch;
    },
    []
  );

  // Define columns with advanced features
  const columns: ColumnDef<ICoupon>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Coupon
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const coupon = row.original;
          return (
            <div className="flex items-center space-x-3">
              {coupon.logo && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={coupon.logo}
                    alt={coupon.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground truncate">
                  {coupon.title}
                </div>
                <p className="text-xs text-muted-foreground truncate font-mono">
                  {coupon.couponCode}
                </p>
              </div>
            </div>
          );
        },
        enableHiding: true,
      },
      {
        accessorKey: 'discountType',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Discount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const coupon = row.original;
          return (
            <div className="text-sm text-foreground">
              {formatDiscount(coupon)}
            </div>
          );
        },
        enableHiding: true,
      },
      {
        accessorKey: 'usageCount',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Usage
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const coupon = row.original;
          const usageLimit = coupon.usageLimit;
          return (
            <div className="text-sm text-foreground">
              {coupon.usageCount}{usageLimit ? ` / ${usageLimit}` : ''}
            </div>
          );
        },
        enableHiding: true,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const coupon = row.original;
          return <StatusBadge status={coupon.status} />;
        },
        enableHiding: true,
      },
      {
        accessorKey: 'startTime',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Start Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue('startTime') as string;
          if (!date) return <div className="text-sm text-muted-foreground">-</div>;
          // Convert UTC date to USA timezone for display
          const utcDate = new Date(date);
          const usaDate = toZonedTime(utcDate, 'America/New_York');
          return (
            <div className="text-sm text-muted-foreground">
              {format(usaDate, 'MMM d, yyyy')} at {format(usaDate, 'h:mm a')}
            </div>
          );
        },
        enableHiding: true,
      },
      {
        accessorKey: 'endTime',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            End Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue('endTime') as string;
          if (!date) return <div className="text-sm text-muted-foreground">-</div>;
          // Convert UTC date to USA timezone for display
          const utcDate = new Date(date);
          const usaDate = toZonedTime(utcDate, 'America/New_York');
          const isExpired = dayjs(date).isBefore(dayjs());
          return (
            <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-muted-foreground'}`}>
              {format(usaDate, 'MMM d, yyyy')} at {format(usaDate, 'h:mm a')}
            </div>
          );
        },
        enableHiding: true,
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const coupon = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/super-admin/coupon/${coupon._id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Coupon
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(coupon._id, coupon.title)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Coupon
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleDelete]
  );

  // Custom filter function for status and type
  const filteredData = useMemo(() => {
    let data = coupons;

    // Apply status filter
    const statusFilter = columnFilters.find(f => f.id === 'status')?.value as string;
    if (statusFilter && statusFilter !== 'all') {
      data = data.filter(coupon => coupon.status === statusFilter);
    }

    // Apply type filter
    const typeFilter = columnFilters.find(f => f.id === 'discountType')?.value as string;
    if (typeFilter && typeFilter !== 'all') {
      data = data.filter(coupon => coupon.discountType === typeFilter);
    }

    return data;
  }, [coupons, columnFilters]);

  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-8 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-destructive mb-2">Error loading coupons</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Coupon Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and track discount coupons
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/super-admin/coupon/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Coupon
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by coupon name or code..."
                value={globalFilter ?? ''}
                onChange={event => setGlobalFilter(event.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={
                (columnFilters.find(f => f.id === 'status')?.value as string) ||
                'all'
              }
              onValueChange={value => {
                if (value === 'all') {
                  setColumnFilters(prev => prev.filter(f => f.id !== 'status'));
                } else {
                  setColumnFilters(prev => [
                    ...prev.filter(f => f.id !== 'status'),
                    { id: 'status', value },
                  ]);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="exhausted">Exhausted</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={
                (columnFilters.find(f => f.id === 'discountType')?.value as string) ||
                'all'
              }
              onValueChange={value => {
                if (value === 'all') {
                  setColumnFilters(prev => prev.filter(f => f.id !== 'discountType'));
                } else {
                  setColumnFilters(prev => [
                    ...prev.filter(f => f.id !== 'discountType'),
                    { id: 'discountType', value },
                  ]);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                <SelectItem value="free_shipping">Free Shipping</SelectItem>
              </SelectContent>
            </Select>

            {/* Column Visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={value =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No coupons found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} coupon
              {table.getFilteredRowModel().rows.length !== 1 ? 's' : ''} selected.
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={value => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map(pageSize => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <span>&laquo;</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <span>&lsaquo;</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <span>&rsaquo;</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <span>&raquo;</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

