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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <ImageIcon className="h-3 w-3" />
            {filledCount} / {MAX_IMAGES}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {canAddMore ? 'Add images with filename, title, alt text' : 'Maximum reached'}
          </span>
        </div>
        {filledCount > 0 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onChange([])}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {slots.map((item, index) => (
          <div
            key={index}
            className={cn(
              'relative rounded-lg border-2 border-dashed p-3 transition-all',
              item?.url
                ? 'border-primary/30 bg-primary/5'
                : 'border-muted-foreground/25 bg-muted/5 hover:border-primary/40'
            )}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {index + 1}
                </Badge>
                {item?.url && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(index)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <ImageUploadWithMeta
                value={item}
                onChange={(v) => handleSlotChange(index, v)}
                folder="ewo-assets/products"
                className="min-h-[120px]"
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
