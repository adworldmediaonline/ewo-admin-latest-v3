'use client';

import React, { useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAddReviewAsAdminMutation } from '@/redux/review/reviewApi';
import { useGetAllProductsQuery } from '@/redux/product/productApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import { IAddReviewPayload } from '@/types/review';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const addReviewSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be 1-5'),
  comment: z.string().optional(),
  guestName: z.string().optional(),
  guestEmail: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
});

type AddReviewFormData = z.infer<typeof addReviewSchema>;

interface AddReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProductId?: string;
  initialProduct?: { _id: string; title: string; img?: string; sku?: string };
}

export function AddReviewDialog({
  open,
  onOpenChange,
  initialProductId,
  initialProduct,
}: AddReviewDialogProps) {
  const [addReview, { isLoading }] = useAddReviewAsAdminMutation();
  const [productSearch, setProductSearch] = useState('');
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    _id: string;
    title: string;
    img?: string;
    sku?: string;
  } | null>(null);

  const { data: productsData } = useGetAllProductsQuery(
    {
      page: 1,
      limit: 20,
      search: productSearch,
    },
    { skip: !productPickerOpen }
  );

  const products = productsData?.data || [];

  const form = useForm<AddReviewFormData>({
    resolver: zodResolver(addReviewSchema),
    defaultValues: {
      productId: '',
      rating: 3,
      comment: '',
      guestName: '',
      guestEmail: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (initialProductId && initialProduct) {
        form.reset({
          productId: initialProductId,
          rating: 3,
          comment: '',
          guestName: '',
          guestEmail: '',
        });
        setSelectedProduct({
          _id: initialProduct._id,
          title: initialProduct.title,
          img: initialProduct.img,
          sku: initialProduct.sku,
        });
      } else {
        form.reset({
          productId: '',
          rating: 3,
          comment: '',
          guestName: '',
          guestEmail: '',
        });
        setSelectedProduct(null);
      }
      setProductSearch('');
    }
  }, [open, form, initialProductId, initialProduct]);

  useEffect(() => {
    if (selectedProduct) {
      form.setValue('productId', selectedProduct._id);
    }
  }, [selectedProduct, form]);

  const handleSubmit = async (values: AddReviewFormData) => {
    const payload: IAddReviewPayload = {
      productId: values.productId,
      rating: values.rating,
      comment: values.comment || undefined,
    };
    if (values.guestName?.trim()) payload.guestName = values.guestName.trim();
    if (values.guestEmail?.trim()) payload.guestEmail = values.guestEmail.trim();

    try {
      const res = await addReview(payload);
      if ('error' in res) {
        const err = res.error as { data?: { message?: string } };
        notifyError(err?.data?.message || 'Failed to add review');
        return;
      }
      notifySuccess('Review added successfully');
      onOpenChange(false);
    } catch {
      notifyError('Failed to add review');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-[500px] min-w-0 overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Add Review</DialogTitle>
          <DialogDescription>
            Add a new review for a product. You can link to a user or use guest fields.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="min-w-0 overflow-hidden space-y-4">
          <div className="min-w-0 w-full overflow-hidden space-y-2">
            <Label htmlFor="product">Product</Label>
            {initialProductId && initialProduct ? (
              <div
                className="flex min-w-0 overflow-hidden items-center gap-3 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm"
                aria-label={`Selected product: ${initialProduct.title}`}
              >
                {initialProduct.img && (
                  <div className="relative w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                    <Image
                      src={initialProduct.img}
                      alt={initialProduct.title}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
                  <span className="truncate text-left font-medium">
                    {initialProduct.title}
                  </span>
                  {initialProduct.sku && (
                    <Badge
                      variant="secondary"
                      className="font-mono text-xs w-fit"
                    >
                      SKU: {initialProduct.sku}
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <Popover open={productPickerOpen} onOpenChange={setProductPickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full min-w-0 overflow-hidden items-start gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {selectedProduct ? (
                      <div className="flex min-w-0 flex-1 flex-col items-stretch gap-1.5 overflow-hidden">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="min-w-0 truncate text-left">
                                {selectedProduct.title}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-sm">
                              <p className="break-words">{selectedProduct.title}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {selectedProduct.sku && (
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs shrink-0"
                          >
                            SKU: {selectedProduct.sku}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select product...</span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-[200px]">
                    {products.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No products found
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {products.map((p) => (
                          <button
                            key={p._id}
                            type="button"
                            className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent transition-colors"
                            onClick={() => {
                              setSelectedProduct({
                                _id: p._id,
                                title: p.title,
                                img: p.img,
                                sku: p.sku,
                              });
                              setProductPickerOpen(false);
                            }}
                          >
                            {p.img && (
                              <div className="relative w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                                <Image
                                  src={p.img}
                                  alt={p.title}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              </div>
                            )}
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="truncate text-sm">{p.title}</span>
                              {p.sku && (
                                <Badge
                                  variant="secondary"
                                  className="font-mono text-xs w-fit mt-0.5"
                                >
                                  {p.sku}
                                </Badge>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            )}
            {form.formState.errors.productId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.productId.message}
              </p>
            )}
          </div>

          <div className="min-w-0 space-y-2">
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

          <div className="min-w-0 space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Write a review comment..."
              {...form.register('comment')}
              className="min-h-[80px]"
            />
          </div>

          <div className="min-w-0 space-y-2">
            <Label htmlFor="guestName">Guest Name (optional)</Label>
            <Input
              id="guestName"
              placeholder="For guest reviews"
              {...form.register('guestName')}
            />
          </div>

          <div className="min-w-0 space-y-2">
            <Label htmlFor="guestEmail">Guest Email (optional)</Label>
            <Input
              id="guestEmail"
              type="email"
              placeholder="For guest reviews"
              {...form.register('guestEmail')}
            />
            {form.formState.errors.guestEmail && (
              <p className="text-sm text-destructive">
                {form.formState.errors.guestEmail.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
