import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import VariantImgUpload from './variant-img-upload';

// prop type
type IPropType = {
  isSubmitted: boolean;
  setImageURLs: React.Dispatch<React.SetStateAction<string[]>>;
  default_value?: string[];
};

const ProductVariants = ({
  isSubmitted,
  setImageURLs,
  default_value,
}: IPropType) => {
  const [formData, setFormData] = useState<string[]>(default_value || []);

  // set default value
  useEffect(() => {
    if (default_value) {
      setFormData(default_value);
      setImageURLs(default_value);
    }
  }, [default_value, setImageURLs]);

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
              Upload multiple images for product variants. Supports up to 15
              images.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <VariantImgUpload
          setFormData={setFormData}
          formData={formData}
          setImageURLs={setImageURLs}
          isSubmitted={isSubmitted}
        />
      </CardContent>
    </Card>
  );
};

export default ProductVariants;
