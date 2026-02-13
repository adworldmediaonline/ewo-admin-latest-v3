import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ImageWithMeta } from '@/types/image-with-meta';
import { Image as ImageIcon } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { VariantImagesWithMeta } from './variant-images-with-meta';

type IPropType = {
  isSubmitted?: boolean;
  imageURLsWithMeta: ImageWithMeta[];
  setImageURLsWithMeta: React.Dispatch<React.SetStateAction<ImageWithMeta[]>>;
  default_value?: string[] | ImageWithMeta[];
};

const ProductVariants = ({
  isSubmitted,
  imageURLsWithMeta,
  setImageURLsWithMeta,
  default_value,
}: IPropType) => {
  // Load default value when editing (product.imageURLsWithMeta or product.imageURLs)
  const hasLoadedDefault = useRef(false);
  useEffect(() => {
    if (!default_value || default_value.length === 0 || hasLoadedDefault.current) return;
    hasLoadedDefault.current = true;
    const first = default_value[0];
    if (typeof first === 'object' && first !== null && 'url' in first && 'fileName' in first) {
      setImageURLsWithMeta(default_value as ImageWithMeta[]);
    } else {
      setImageURLsWithMeta(
        (default_value as string[]).map((url) => ({
          url,
          fileName: '',
          title: '',
          altText: '',
        }))
      );
    }
  }, [default_value, setImageURLsWithMeta]);

  return (
    <Card className="shadow-card">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-orange-50 flex items-center justify-center shrink-0">
            <ImageIcon className="h-3.5 w-3.5 text-orange-600" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold">Variant Images</CardTitle>
            <p className="text-xs text-muted-foreground">Up to 15 images with filename, title, alt text</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        <VariantImagesWithMeta
          value={imageURLsWithMeta}
          onChange={setImageURLsWithMeta}
          isSubmitted={isSubmitted}
        />
      </CardContent>
    </Card>
  );
};

export default ProductVariants;
