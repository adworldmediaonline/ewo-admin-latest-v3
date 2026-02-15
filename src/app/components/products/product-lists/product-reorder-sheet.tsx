'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { GripVertical } from 'lucide-react';
import Image from 'next/image';
import {
  useGetProductsForReorderQuery,
  useReorderProductMutation,
} from '@/redux/product/productApi';
import { notifyError, notifySuccess } from '@/utils/toast';

const toSlug = (label: string): string =>
  label
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

type ProductForReorder = {
  _id: string;
  title: string;
  sku: string;
  sortKey?: string;
  category?: { name: string };
  img?: string;
};

const SortableProductRow = ({
  product,
  isOverlay = false,
}: {
  product: ProductForReorder;
  isOverlay?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product._id, disabled: isOverlay });

  const style: React.CSSProperties = isOverlay
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      };

  const imgSrc =
    product.img ||
    (product as { imageURLs?: string[] }).imageURLs?.[0] ||
    '/placeholder-product.png';

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm"
    >
      <div
        {...(isOverlay ? {} : attributes)}
        {...(isOverlay ? {} : listeners)}
        className="flex shrink-0 cursor-grab touch-none rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image
          src={imgSrc}
          alt={product.title}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {product.title}
        </p>
        <p className="text-xs text-muted-foreground">#{product.sku}</p>
      </div>
      {product.category?.name && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {product.category.name}
        </span>
      )}
    </div>
  );
};

interface ProductReorderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductReorderSheet = ({
  open,
  onOpenChange,
}: ProductReorderSheetProps) => {
  const [categorySlug, setCategorySlug] = useState<string>('');
  const { data, isLoading } = useGetProductsForReorderQuery(
    { category: categorySlug },
    { skip: !open }
  );
  const [reorderProduct, { isLoading: isReordering }] =
    useReorderProductMutation();
  const [activeProduct, setActiveProduct] = useState<ProductForReorder | null>(
    null
  );
  const [optimisticOrder, setOptimisticOrder] = useState<string[] | null>(null);

  const products = useMemo(() => {
    const list = data?.data ?? [];
    if (optimisticOrder) {
      return optimisticOrder
        .map((id) => list.find((p) => p._id === id))
        .filter(Boolean) as ProductForReorder[];
    }
    return list;
  }, [data?.data, optimisticOrder]);

  const categoryOptions = useMemo(() => {
    const names = new Set<string>();
    (data?.data ?? []).forEach((p) => {
      if (p.category?.name) names.add(p.category.name);
    });
    return Array.from(names).sort();
  }, [data?.data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const product = products.find((p) => p._id === event.active.id);
    setActiveProduct(product ?? null);
  }, [products]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveProduct(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = products.findIndex((p) => p._id === active.id);
      const newIndex = products.findIndex((p) => p._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(products, oldIndex, newIndex);
      const productId = active.id as string;
      const prevProduct = newIndex > 0 ? reordered[newIndex - 1] : null;
      const nextProduct =
        newIndex < reordered.length - 1 ? reordered[newIndex + 1] : null;

      setOptimisticOrder(reordered.map((p) => p._id));

      try {
        await reorderProduct({
          productId,
          prevProductId: prevProduct?._id ?? null,
          nextProductId: nextProduct?._id ?? null,
        }).unwrap();
        notifySuccess('Product reordered');
        setOptimisticOrder(null);
      } catch {
        setOptimisticOrder(null);
        notifyError('Failed to reorder product');
      }
    },
    [products, reorderProduct]
  );

  const handleCategoryChange = (value: string) => {
    setCategorySlug(value);
    setOptimisticOrder(null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Reorder Products</SheetTitle>
          <SheetDescription>
            Drag and drop to reorder. Changes save automatically.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Category filter</label>
            <Select
              value={categorySlug || 'all'}
              onValueChange={(v) =>
                handleCategoryChange(v === 'all' ? '' : v)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categoryOptions.map((name) => (
                  <SelectItem key={name} value={toSlug(name)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-280px)] pr-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={products.map((p) => p._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {products.map((product) => (
                      <SortableProductRow
                        key={product._id}
                        product={product}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeProduct ? (
                    <SortableProductRow
                      product={activeProduct}
                      isOverlay
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </ScrollArea>
          )}

          {!isLoading && products.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No products to reorder.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
