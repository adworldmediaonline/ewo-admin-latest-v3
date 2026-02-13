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
    <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">
              Product Variations
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload variant images with filename, title, and alt text. Supports
              up to 15 images.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
