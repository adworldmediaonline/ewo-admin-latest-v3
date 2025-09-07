import React, { useEffect, useState } from 'react';
import Loading from '../../common/loading';
import { useUploadImageMutation } from '@/redux/cloudinary/cloudinaryApi';
import { Drug } from '@/svg';

type IPropType = {
  imgUrl: string;
  setImgUrl: React.Dispatch<React.SetStateAction<string>>;
  isSubmitted: boolean;
  default_img?: string;
};

const ProductImgUpload = ({
  imgUrl,
  setImgUrl,
  isSubmitted,
  default_img,
}: IPropType) => {
  const [initialLoad, setInitialLoad] = useState(true);
  const [uploadImage, { data: uploadData, isError, isLoading }] =
    useUploadImageMutation();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('image', file);
      uploadImage(formData);
    }
  };

  useEffect(() => {
    if (uploadData && !isError) {
      setImgUrl(uploadData.data.url);
    }
  }, [uploadData, isError, setImgUrl]);

  useEffect(() => {
    if (default_img && initialLoad) {
      setImgUrl(default_img);
      setInitialLoad(false);
    }
  }, [default_img, initialLoad, setImgUrl]);

  return (
    <div className="bg-white px-8 py-8 rounded-md mb-6">
      <p className="text-base text-black mb-4">Main Product Image</p>

      <div className="mb-5">
        <input
          onChange={handleImageUpload}
          type="file"
          name="image"
          id="product_img"
          className="hidden"
          accept="image/*"
        />
        <label
          htmlFor="product_img"
          className="border-2 border-gray6 dark:border-gray-600 border-dashed rounded-md cursor-pointer flex items-center justify-center h-[44px] leading-[44px] hover:bg-slate-100 transition-all linear ease"
        >
          <span className="mx-auto flex justify-center items-center">
            <Drug />
            <span className="ml-2">Drop image here or click to upload</span>
          </span>
        </label>
      </div>

      <div className="relative">
        {isLoading ? (
          <div className="flex justify-center">
            <Loading loading={isLoading} spinner="scale" />
          </div>
        ) : imgUrl ? (
          <div className="relative">
            <img
              src={imgUrl}
              alt="Product"
              className="w-full h-48 object-cover rounded-md"
            />
            <button
              onClick={() => setImgUrl('')}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
            <span className="text-gray-400">No image uploaded</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImgUpload;
