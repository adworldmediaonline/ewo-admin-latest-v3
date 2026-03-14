'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUpdateReviewMutation } from '@/redux/review/reviewApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import { IReviewItem } from '@/types/review';

const editReviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be 1-5'),
  comment: z.string().optional(),
});

type EditReviewFormData = z.infer<typeof editReviewSchema>;

interface EditReviewDialogProps {
  review: IReviewItem | null;
  onClose: () => void;
}

const getProductDisplay = (review: IReviewItem): { title: string; sku?: string } => {
  const product = review.productId;
  if (!product) return { title: '—' };
  if (typeof product === 'object') {
    const p = product as { title?: string; sku?: string };
    return { title: p.title ?? 'Product', sku: p.sku };
  }
  return { title: 'Product' };
};

const ProductDisplay = ({ review }: { review: IReviewItem }) => {
  const { title, sku } = getProductDisplay(review);
  return (
    <div className="flex flex-col gap-2 rounded-md border bg-muted/50 px-3 py-2">
      <span className="text-sm font-medium">{title}</span>
      {sku && (
        <Badge variant="secondary" className="font-mono text-xs w-fit">
          SKU: {sku}
        </Badge>
      )}
    </div>
  );
};

export function EditReviewDialog({ review, onClose }: EditReviewDialogProps) {
  const [updateReview, { isLoading }] = useUpdateReviewMutation();
  const open = !!review;

  const form = useForm<EditReviewFormData>({
    resolver: zodResolver(editReviewSchema),
    defaultValues: {
      rating: 3,
      comment: '',
    },
  });

  useEffect(() => {
    if (review) {
      form.reset({
        rating: review.rating,
        comment: review.comment || '',
      });
    }
  }, [review, form]);

  const handleSubmit = async (values: EditReviewFormData) => {
    if (!review) return;
    try {
      const res = await updateReview({
        id: review._id,
        data: {
          rating: values.rating,
          comment: values.comment,
        },
      });
      if ('error' in res) {
        const err = res.error as { data?: { message?: string } };
        notifyError(err?.data?.message || 'Failed to update review');
        return;
      }
      notifySuccess('Review updated successfully');
      onClose();
    } catch {
      notifyError('Failed to update review');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
          <DialogDescription>
            Update the rating and comment for this review.
          </DialogDescription>
        </DialogHeader>
        {review && (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <ProductDisplay review={review} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={String(form.watch('rating'))}
                onValueChange={(v) => form.setValue('rating', parseInt(v, 10))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                placeholder="Review comment..."
                {...form.register('comment')}
                className="min-h-[80px]"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
