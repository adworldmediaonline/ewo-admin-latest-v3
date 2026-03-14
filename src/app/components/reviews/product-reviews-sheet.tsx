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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useGetAllReviewsQuery,
  useDeleteReviewMutation,
} from '@/redux/review/reviewApi';
import { IProduct } from '@/types/product';
import { IReviewItem } from '@/types/review';
import { Edit, Plus, Star, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { notifyError, notifySuccess } from '@/utils/toast';
import { AddReviewDialog } from './add-review-dialog';
import { EditReviewDialog } from './edit-review-dialog';

const StarRating = ({ rating, size = 14 }: { rating: number; size?: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }, (_, i) => (
        <Star
          key={`full-${i}`}
          size={size}
          className="fill-amber-400 text-amber-400 shrink-0"
        />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star size={size} className="text-gray-300 shrink-0" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star size={size} className="fill-amber-400 text-amber-400 shrink-0" />
          </div>
        </div>
      )}
      {Array.from({ length: emptyStars }, (_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-gray-300 shrink-0" />
      ))}
    </div>
  );
};

const getReviewerDisplay = (review: IReviewItem): string => {
  const user = review.userId;
  if (user && typeof user === 'object' && 'name' in user) {
    return (user as { name?: string; email?: string }).name || (user as { email?: string }).email || 'User';
  }
  if (review.guestName) return review.guestName;
  if (review.guestEmail) return review.guestEmail;
  return 'Guest';
};

interface ProductReviewsSheetProps {
  product: IProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductReviewsSheet({
  product,
  open,
  onOpenChange,
}: ProductReviewsSheetProps) {
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();
  const [editReview, setEditReview] = useState<IReviewItem | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; comment: string } | null>(null);

  const { data, isLoading } = useGetAllReviewsQuery(
    {
      page: 1,
      limit: 100,
      productId: product?._id || '',
    },
    { skip: !open || !product?._id }
  );

  const reviews = data?.data || [];

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

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  if (!product) return null;

  const img = product.img || product.imageURLs?.[0] || '/placeholder-product.png';

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl overflow-y-auto flex flex-col"
        >
          <SheetHeader className="px-6 pr-12 shrink-0">
            <div className="flex items-start gap-4 min-w-0">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                <img
                  src={img}
                  alt={product.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-base font-semibold truncate">
                  {product.title}
                </SheetTitle>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {product.sku && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {product.sku}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </span>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-1">
                      <StarRating rating={avgRating} size={12} />
                      <span className="text-xs text-muted-foreground">
                        {avgRating.toFixed(1)} avg
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-col gap-4 pt-6 px-6 pb-6 min-w-0 overflow-hidden">
            <Button
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              className="w-fit"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Review
            </Button>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 rounded bg-muted animate-pulse" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No reviews yet. Add the first review for this product.
              </p>
            ) : (
              <div className="rounded-md border min-w-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead className="w-[88px] pr-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((r) => (
                      <TableRow key={r._id}>
                        <TableCell>
                          <StarRating rating={r.rating} size={14} />
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="block truncate text-sm">
                                  {r.comment || '—'}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs break-words">{r.comment || '—'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-sm">
                          {getReviewerDisplay(r)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(r.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="pr-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditReview(r)}
                              aria-label="Edit review"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() =>
                                setDeleteTarget({
                                  id: r._id,
                                  comment: r.comment?.slice(0, 30) || '',
                                })
                              }
                              aria-label="Delete review"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AddReviewDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        initialProductId={product._id}
        initialProduct={{
          _id: product._id,
          title: product.title,
          sku: product.sku,
          img: product.img,
        }}
      />
      <EditReviewDialog review={editReview} onClose={() => setEditReview(null)} />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => !isDeleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
              {deleteTarget?.comment ? ` Review: "${deleteTarget.comment}..."` : ''}
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
    </>
  );
}
