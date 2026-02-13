'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImageUploadWithMeta } from '@/components/image-upload-with-meta/image-upload-with-meta';
import type { ImageWithMeta } from '@/types/image-with-meta';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import React, { useCallback } from 'react';

const MAX_IMAGES = 15;

type IPropType = {
  value: ImageWithMeta[];
  onChange: (value: ImageWithMeta[]) => void;
  isSubmitted?: boolean;
};

export const VariantImagesWithMeta = ({
  value,
  onChange,
  isSubmitted,
}: IPropType) => {
  const filledCount = value.length;
  const canAddMore = value.length < MAX_IMAGES;
  // Show filled slots + one empty "add" slot when under limit
  const slots = canAddMore ? [...value, null] : value;

  const handleSlotChange = useCallback(
    (index: number, item: ImageWithMeta | null) => {
      if (item === null) {
        if (index < value.length) {
          onChange(value.filter((_, i) => i !== index));
        }
      } else {
        if (index < value.length) {
          const next = [...value];
          next[index] = item;
          onChange(next);
        } else {
          onChange([...value, item]);
        }
      }
    },
    [value, onChange]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const next = value.filter((_, i) => i !== index);
      onChange(next);
    },
    [value, onChange]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Badge variant="secondary" className="gap-1 text-xs">
          <ImageIcon className="h-3 w-3" />
          {filledCount} / {MAX_IMAGES}
        </Badge>
        {filledCount > 0 && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange([])}
            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {slots.map((item, index) => (
          <div
            key={index}
            className={cn(
              'relative rounded-md border-2 border-dashed p-2 transition-all',
              item?.url
                ? 'border-primary/30 bg-primary/5'
                : 'border-muted-foreground/25 bg-muted/5 hover:border-primary/40'
            )}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-medium text-muted-foreground">{index + 1}</span>
                {item?.url && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(index)}
                    className="h-5 w-5 p-0 min-w-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </Button>
                )}
              </div>
              <ImageUploadWithMeta
                value={item}
                onChange={(v) => handleSlotChange(index, v)}
                folder="ewo-assets/products"
                className="min-h-[88px]"
              />
            </div>
          </div>
        ))}
      </div>


      <p className="text-xs text-muted-foreground">
        Each image supports filename, title, and alt text for SEO and accessibility.
      </p>
    </div>
  );
};
