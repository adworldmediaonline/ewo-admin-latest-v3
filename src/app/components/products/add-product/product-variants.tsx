import React, { useState, useEffect } from 'react';
import { notifyError } from '@/utils/toast';
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
    <div className="bg-white px-8 py-8 rounded-md mb-6">
      <h4 className="text-[22px] mb-6">Product Variations</h4>
      <div className="mt-4">
        <VariantImgUpload
          setFormData={setFormData}
          formData={formData}
          setImageURLs={setImageURLs}
          isSubmitted={isSubmitted}
        />
      </div>
    </div>
  );
};

export default ProductVariants;
