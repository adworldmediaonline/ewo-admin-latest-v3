'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useGetAllReviewsQuery,
  useDeleteReviewMutation,
} from '@/redux/review/reviewApi';
import { IProduct } from '@/types/product';
import { IReviewItem } from '@/types/review';
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
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { notifyError, notifySuccess } from '@/utils/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddReviewDialog } from './add-review-dialog';
import { EditReviewDialog } from './edit-review-dialog';
import { ProductReviewsSheet } from './product-reviews-sheet';
import { ProductsWithReviewsTable } from './products-with-reviews-table';

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }, (_, i) => (
        <Star
          key={`full-${i}`}
          size={size}
          className="fill-amber-400 text-amber-400 shrink-0 transition-colors"
        />
      ))}
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

const getReviewerDisplay = (review: IReviewItem): string => {
  const user = review.userId;
  if (user && typeof user === 'object' && 'name' in user) {
    return (user as { name: string; email?: string }).name || (user as { email?: string }).email || 'User';
  }
  if (review.guestName) return review.guestName;
  if (review.guestEmail) return review.guestEmail;
  return 'Guest';
};

type ViewMode = 'by-product' | 'all-reviews';

export default function ReviewListArea() {
  const [viewMode, setViewMode] = useState<ViewMode>('by-product');
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editReview, setEditReview] = useState<IReviewItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; comment: string } | null>(null);

  const handleViewReviews = (product: IProduct) => {
    setSelectedProduct(product);
    setSheetOpen(true);
  };

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(globalFilter.trim()), 300);
    return () => clearTimeout(timer);
  }, [globalFilter]);

  React.useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch, ratingFilter, productFilter]);

  const { data: reviewsData, isError, isLoading } = useGetAllReviewsQuery(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearch,
      rating: ratingFilter === 'all' ? '' : ratingFilter,
      productId: productFilter || '',
    },
    { skip: viewMode === 'by-product' }
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteReview(deleteTarget.id);
      if ('error' in res) {
        const err = res.error as { data?: { message?: string } };
        notifyError(err?.data?.message || 'Failed to delete review');
      } else {
        notifySuccess('Review deleted successfully');
        setDeleteTarget(null);
      }
    } catch {
      notifyError('Failed to delete review');
    }
  };

  const reviewData = reviewsData?.data || [];
  const totalReviews = reviewsData?.pagination?.total || 0;
  const totalPages = reviewsData?.pagination?.pages || 0;

  const columns: ColumnDef<IReviewItem>[] = useMemo(
    () => [
      {
        accessorKey: 'productId',
        header: 'Product',
        cell: ({ row }) => {
          const product = row.original.productId;
          if (!product) return <span className="text-muted-foreground">—</span>;
          const p = typeof product === 'object' ? product : null;
          const id = p?._id ?? (typeof product === 'string' ? product : '');
          const title = p?.title ?? 'Product';
          const img = p?.img ?? '';
          const slug = p?.slug ?? '';
          const sku = p && typeof p === 'object' && 'sku' in p ? (p as { sku?: string }).sku : undefined;
          return (
            <div className="flex items-center space-x-3">
              {img && (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                  <Image
                    src={img}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/dashboard/super-admin/product/edit/${id}`}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block"
                >
                  {title}
                </Link>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  {sku && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {sku}
                    </Badge>
                  )}
                  {slug && (
                    <p className="text-xs text-muted-foreground truncate">{slug}</p>
                  )}
                </div>
              </div>
            </div>
          );
        },
        enableHiding: true,
      },
      {
        accessorKey: 'rating',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Rating
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <StarRating rating={row.original.rating} />,
        enableHiding: true,
      },
      {
        accessorKey: 'comment',
        header: 'Comment',
        cell: ({ row }) => {
          const comment = row.original.comment || '';
          const truncated = comment.length > 60 ? `${comment.slice(0, 60)}...` : comment;
          if (!comment) return <span className="text-muted-foreground">—</span>;
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block max-w-[200px] truncate text-sm">{truncated}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="whitespace-pre-wrap">{comment}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        enableHiding: true,
      },
      {
        id: 'reviewer',
        header: 'Reviewer',
        cell: ({ row }) => (
          <span className="text-sm">{getReviewerDisplay(row.original)}</span>
        ),
        enableHiding: true,
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {format(new Date(row.original.createdAt), 'MMM d, yyyy')}
          </span>
        ),
        enableHiding: true,
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const review = row.original;
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
                <DropdownMenuItem onClick={() => setEditReview(review)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() =>
                    setDeleteTarget({
                      id: review._id,
                      comment: review.comment?.slice(0, 50) || '',
                    })
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: reviewData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
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

  const showAllReviewsLoading = viewMode === 'all-reviews' && isLoading;
  const showAllReviewsError = viewMode === 'all-reviews' && isError;

  if (showAllReviewsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
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

  if (showAllReviewsError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-destructive mb-2">Error loading reviews</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Reviews
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage product reviews
                </p>
              </div>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Review
              </Button>
            </div>
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as ViewMode)}
              className="w-full"
            >
              <TabsList className="w-fit">
                <TabsTrigger value="by-product">By Product</TabsTrigger>
                <TabsTrigger value="all-reviews">All Reviews</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          {viewMode === 'by-product' ? (
            <ProductsWithReviewsTable onViewReviews={handleViewReviews} />
          ) : (
            <>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by comment, product title, or SKU..."
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  setPagination(prev => ({ ...prev, pageIndex: 0 }));
                }}
                className="pl-10"
                aria-label="Search reviews by comment, product title, or SKU"
              />
            </div>
            <Select
              value={ratingFilter}
              onValueChange={(v) => {
                setRatingFilter(v);
                setPagination(prev => ({ ...prev, pageIndex: 0 }));
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Product ID (optional)"
              value={productFilter}
              onChange={(e) => {
                setProductFilter(e.target.value);
                setPagination(prev => ({ ...prev, pageIndex: 0 }));
              }}
              className="w-[180px]"
              aria-label="Filter by product ID"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize"
                      checked={col.getIsVisible()}
                      onCheckedChange={(v) => col.toggleVisibility(!!v)}
                    >
                      {col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder
                          ? null
                          : flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
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
                      No reviews found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''} total
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(v) => table.setPageSize(Number(v))}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((ps) => (
                      <SelectItem key={ps} value={`${ps}`}>
                        {ps}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {totalPages || 1} ({totalReviews} total)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                >
                  <span className="sr-only">Go to first page</span>
                  <span>&laquo;</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <span className="sr-only">Go to previous page</span>
                  <span>&lsaquo;</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <span className="sr-only">Go to next page</span>
                  <span>&rsaquo;</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                >
                  <span className="sr-only">Go to last page</span>
                  <span>&raquo;</span>
                </Button>
              </div>
            </div>
          </div>
            </>
          )}
        </CardContent>
      </Card>

      <ProductReviewsSheet
        product={selectedProduct}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
      <AddReviewDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <EditReviewDialog
        review={editReview}
        onClose={() => setEditReview(null)}
      />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => !isDeleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the review
              {deleteTarget?.comment ? `: "${deleteTarget.comment}..."` : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
