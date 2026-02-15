'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { useGetAllProductsQuery, useDeleteProductMutation, useUpdateProductPublishStatusMutation, authApi } from '@/redux/product/productApi';
import { store } from '@/redux/store';
import { IProduct } from '@/types/product';
import { exportProductsToCSV } from '@/utils/export-products';
import { notifyError, notifySuccess } from '@/utils/toast';
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
  Download,
  Edit,
  Eye,
  EyeOff,
  GripVertical,
  MoreHorizontal,
  Package,
  RefreshCw,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useMemo, useState } from 'react';
import { ProductReorderSheet } from './product-reorder-sheet';

// Custom Star Rating Component
const StarRating = ({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {/* Full stars */}
      {Array.from({ length: fullStars }, (_, i) => (
        <Star
          key={`full-${i}`}
          size={size}
          className="fill-amber-400 text-amber-400 shrink-0 transition-colors"
        />
      ))}

      {/* Half star */}
      {hasHalfStar && (
        <div className="relative">
          <Star size={size} className="text-gray-300 shrink-0" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star
              size={size}
              className="fill-amber-400 text-amber-400 shrink-0"
            />
          </div>
        </div>
      )}

      {/* Empty stars */}
      {Array.from({ length: emptyStars }, (_, i) => (
        <Star
          key={`empty-${i}`}
          size={size}
          className="text-gray-300 shrink-0"
        />
      ))}
    </div>
  );
};

export default function ProductListArea() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);
  const [publishStatusFilter, setPublishStatusFilter] = useState<string>('');
  const [deleteDialogProductId, setDeleteDialogProductId] = useState<string | null>(null);
  const [reorderSheetOpen, setReorderSheetOpen] = useState(false);

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updatePublishStatus] = useUpdateProductPublishStatusMutation();

  // Debounce search to avoid too many API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(globalFilter.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [globalFilter]);

  // Reset pagination when search changes
  React.useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  // Get status filter value
  const statusFilter = useMemo(() => {
    const statusColumn = columnFilters.find(filter => filter.id === 'status');
    return statusColumn?.value as string || '';
  }, [columnFilters]);

  // Fetch products with server-side pagination
  const { data: products, isError, isLoading } = useGetAllProductsQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: debouncedSearch,
    status: statusFilter === 'all' ? '' : statusFilter,
    publishStatus: publishStatusFilter === 'all' ? '' : publishStatusFilter,
  });

  const handleTogglePublishStatus = useCallback(
    async (product: IProduct, newStatus: 'draft' | 'published') => {
      try {
        const res = await updatePublishStatus({
          id: product._id,
          publishStatus: newStatus,
        });
        if ('error' in res && res.error) {
          const err = res.error as { data?: { message?: string } };
          notifyError(err.data?.message || 'Failed to update product');
        } else {
          notifySuccess(`Product ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
        }
      } catch {
        notifyError('Failed to update product');
      }
    },
    [updatePublishStatus]
  );

  const handleDeleteProduct = useCallback(
    async (productId: string) => {
      try {
        const res = await deleteProduct(productId);
        if ('error' in res && res.error) {
          const err = res.error as { data?: { message?: string } };
          notifyError(err.data?.message || 'Failed to delete product');
        } else {
          setDeleteDialogProductId(null);
          notifySuccess('Product deleted successfully');
        }
      } catch {
        notifyError('Failed to delete product');
      }
    },
    [deleteProduct]
  );

  // Define columns with advanced features - handleDeleteProduct and setDeleteDialogProductId in closure
  const columns: ColumnDef<IProduct>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Product',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={
                    product.img ||
                    product.imageURLs?.[0] ||
                    '/placeholder-product.png'
                  }
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/dashboard/super-admin/product/edit/${product._id}`}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block"
                >
                  {product.title}
                </Link>
                <p className="text-xs text-muted-foreground truncate">
                  {product.category?.name}
                </p>
              </div>
            </div>
          );
        },
        enableHiding: true,
      },
      {
        accessorKey: 'sku',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            SKU
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-sm text-muted-foreground">
            #{row.getValue('sku')}
          </div>
        ),
        enableHiding: true,
      },
      {
        accessorKey: 'quantity',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Quantity
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const quantity = row.getValue('quantity') as number;
          return <div className="text-sm font-medium">{quantity}</div>;
        },
        enableHiding: true,
      },
      {
        accessorKey: 'finalPriceDiscount',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Final Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const finalPriceDiscount = row.getValue(
            'finalPriceDiscount'
          ) as number;
          return (
            <div className="text-sm font-medium">
              ${finalPriceDiscount.toFixed(2)}
            </div>
          );
        },
        enableHiding: true,
      },
      {
        accessorKey: 'reviews',
        header: 'Rating',
        cell: ({ row }) => {
          const reviews = row.getValue('reviews') as IProduct['reviews'];
          const averageRating =
            reviews && reviews.length > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
              : 0;

          // Handle case where there are no reviews
          if (!reviews || reviews.length === 0) {
            return (
              <div className="flex items-center gap-2">
                <div className="flex items-center shrink-0">
                  <StarRating rating={0} size={14} />
                </div>
                <span className="text-xs text-muted-foreground">
                  No reviews
                </span>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center shrink-0">
                <StarRating rating={averageRating} size={14} />
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs text-amber-600 font-medium">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({reviews.length})
                </span>
              </div>
            </div>
          );
        },
        enableHiding: true,
      },
      {
        accessorKey: 'status',
        header: 'Stock',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <Badge
              variant={status === 'in-stock' ? 'default' : 'secondary'}
              className={`text-xs ${status === 'in-stock'
                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                : 'bg-red-100 text-red-800 hover:bg-red-100'
                }`}
            >
              {status === 'in-stock' ? (
                <>
                  <Package className="w-3 h-3 mr-1" />
                  In Stock
                </>
              ) : (
                'Out of Stock'
              )}
            </Badge>
          );
        },
        enableHiding: true,
      },
      {
        accessorKey: 'publishStatus',
        header: 'Visibility',
        cell: ({ row }) => {
          const publishStatus = (row.original as IProduct & { publishStatus?: string }).publishStatus || 'published';
          return (
            <Badge
              variant="secondary"
              className={`text-xs ${publishStatus === 'published'
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                }`}
            >
              {publishStatus === 'published' ? 'Published' : 'Draft'}
            </Badge>
          );
        },
        enableHiding: true,
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const product = row.original;

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
                  <Link
                    href={`/dashboard/super-admin/product/preview/${product._id}`}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/super-admin/product/edit/${product._id}`}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Product
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(row.original as IProduct & { publishStatus?: string }).publishStatus === 'draft' ? (
                  <DropdownMenuItem
                    onClick={() => handleTogglePublishStatus(product, 'published')}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Publish
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleTogglePublishStatus(product, 'draft')}
                  >
                    <EyeOff className="mr-2 h-4 w-4" />
                    Unpublish
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteDialogProductId(product._id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Product
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [setDeleteDialogProductId, handleTogglePublishStatus]
  );

  const productData = products?.data || [];
  const totalProducts = products?.pagination?.total || 0;
  const totalPages = products?.pagination?.pages || 0;

  // Download all products functionality
  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      const allProducts: IProduct[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      const pageSize = 100; // Fetch 100 products per page for efficiency

      // Fetch all pages of products (without filters to get ALL products)
      while (hasMorePages) {
        const result = await store.dispatch(
          authApi.endpoints.getAllProducts.initiate({
            page: currentPage,
            limit: pageSize,
            search: '', // Download ALL products regardless of current filters
            status: '', // Download ALL products regardless of current filters
          })
        );

        if (result.data?.data) {
          allProducts.push(...result.data.data);

          // Check if there are more pages
          const totalPages = result.data.pagination?.pages || 0;
          hasMorePages = currentPage < totalPages;
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }

      // Export all products
      if (allProducts.length > 0) {
        exportProductsToCSV(allProducts);
      } else {
        alert('No products found to export');
      }
    } catch (error) {
      console.error('Error downloading all products:', error);
      alert('Failed to download all products. Please try again.');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  // Initialize table with server-side pagination
  const table = useReactTable({
    data: productData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    // Enable server-side pagination
    manualPagination: true,
    pageCount: totalPages,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
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
            <p className="text-destructive mb-2">Error loading products</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ProductReorderSheet
        open={reorderSheetOpen}
        onOpenChange={setReorderSheetOpen}
      />
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your product inventory
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (products?.data && products.data.length > 0) {
                    exportProductsToCSV(products.data);
                  } else {
                    alert('No products available to export');
                  }
                }}
                disabled={isLoading || !products?.data || products.data.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadAll}
                disabled={isDownloadingAll}
              >
                {isDownloadingAll ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download All
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setReorderSheetOpen(true)}
                aria-label="Reorder products"
              >
                <GripVertical className="mr-2 h-4 w-4" />
                Reorder
              </Button>
              <Button asChild>
                <Link href="/dashboard/super-admin/product/add">
                  <Package className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                value={globalFilter ?? ''}
                onChange={event => {
                  setGlobalFilter(event.target.value);
                  // Reset to first page when searching
                  setPagination(prev => ({ ...prev, pageIndex: 0 }));
                }}
                className="pl-10"
              />
            </div>

            {/* Stock Status Filter */}
            <Select
              value={
                (table.getColumn('status')?.getFilterValue() as string) ?? ''
              }
              onValueChange={value =>
                table
                  .getColumn('status')
                  ?.setFilterValue(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Publish Status Filter */}
            <Select
              value={publishStatusFilter || 'all'}
              onValueChange={value => {
                setPublishStatusFilter(value === 'all' ? '' : value);
                setPagination(prev => ({ ...prev, pageIndex: 0 }));
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visibility</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
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
                      No products found.
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
              {totalProducts} product(s) selected.
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
                {totalPages || 1} ({totalProducts} total)
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

          {/* Download All Button at Bottom */}
          <div className="px-6 py-4 border-t border-border bg-muted/20">
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleDownloadAll}
                disabled={isDownloadingAll}
                className="inline-flex items-center px-6 py-3"
              >
                {isDownloadingAll ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Downloading All Products...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download All Products
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteDialogProductId}
        onOpenChange={open => !open && setDeleteDialogProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and remove it from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() =>
                deleteDialogProductId && handleDeleteProduct(deleteDialogProductId)
              }
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
