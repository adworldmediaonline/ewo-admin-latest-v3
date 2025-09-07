import React, { useEffect, useState } from 'react';
import { Drug } from '@/svg';
import Loading from '../../common/loading';
import {
  useUploadImageMultipleMutation,
  useDeleteCloudinaryImgMutation,
} from '@/redux/cloudinary/cloudinaryApi';
import { notifyError, notifySuccess } from '@/utils/toast';

type IPropType = {
  formData: string[];
  setFormData: React.Dispatch<React.SetStateAction<string[]>>;
  setImageURLs: React.Dispatch<React.SetStateAction<string[]>>;
  isSubmitted: boolean;
};

const MAX_IMAGES = 10;

const VariantImgUpload = ({
  setFormData,
  formData,
  setImageURLs,
  isSubmitted,
}: IPropType) => {
  const [uploadImages, { data: uploadData, isError, isLoading }] =
    useUploadImageMultipleMutation();
  const [deleteImage] = useDeleteCloudinaryImgMutation();

  // handle multiple image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files && e.target.files.length > 0) {
      // Check if adding new images would exceed the limit
      if (formData.length + e.target.files.length > MAX_IMAGES) {
        notifyError(`You can only upload up to ${MAX_IMAGES} images in total`);
        return;
      }

      const files = Array.from(e.target.files);
      const uploadFormData = new FormData();

      files.forEach(file => {
        uploadFormData.append('images', file);
      });

      try {
        const response = await uploadImages(uploadFormData).unwrap();
        if (response.success && response.data) {
          const newUrls = response.data.map((item: any) => item.url);
          setFormData(prevUrls => [...prevUrls, ...newUrls]);
          setImageURLs(prevUrls => [...prevUrls, ...newUrls]);
          notifySuccess('Images uploaded successfully');
        }
      } catch (error) {
        console.error('Upload failed:', error);
        notifyError('Failed to upload images');
      }
    }
  };

  // Handle image removal
  const handleRemoveImage = async (url: string, index: number) => {
    try {
      // Extract public_id from cloudinary URL
      const urlParts = url.split('/');
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExt.split('.')[0];
      const folder = urlParts[urlParts.length - 2];

      // Delete from cloudinary
      await deleteImage({
        folder_name: folder,
        id: publicId,
      }).unwrap();

      // Remove from local state
      setFormData(prev => prev.filter((_, i) => i !== index));
      setImageURLs(prev => prev.filter((_, i) => i !== index));
      notifySuccess('Image removed successfully');
    } catch (error) {
      console.error('Failed to remove image:', error);
      notifyError('Failed to remove image');
    }
  };

  // Sync formData with imageURLs on mount
  useEffect(() => {
    setImageURLs(formData);
  }, []);

  return (
    <div className="px-8 py-8 mb-6 bg-white rounded-md">
      <div className="mb-5">
        <p className="mb-2 text-base text-black">
          Upload variant images (multiple)
        </p>
        <div className="mb-2">
          <span className="text-sm text-gray-500">
            {formData.length} of {MAX_IMAGES} images uploaded
          </span>
        </div>
        <input
          onChange={handleImageUpload}
          type="file"
          name="images"
          id="variant_images"
          className="hidden"
          multiple
          accept="image/*"
          disabled={formData.length >= MAX_IMAGES}
        />
        <label
          htmlFor="variant_images"
          className={`flex items-center justify-center h-[100px] border-2 border-gray6 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:bg-slate-100 transition-all linear ease ${
            formData.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="text-center">
            <span className="flex justify-center mx-auto mb-2">
              <Drug />
            </span>
            <span className="text-gray-600">
              {formData.length >= MAX_IMAGES ? (
                'Maximum number of images reached'
              ) : (
                <>
                  Drop images here or click to upload
                  <br />
                  <span className="text-sm text-gray-400">
                    (You can select multiple images, up to {MAX_IMAGES} total)
                  </span>
                </>
              )}
            </span>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {isLoading ? (
          <div className="flex justify-center col-span-4">
            <Loading loading={isLoading} spinner="scale" />
          </div>
        ) : (
          formData.map((url, idx) => (
            <div key={idx} className="relative group">
              <img
                src={url}
                alt={`Variant ${idx + 1}`}
                className="object-cover w-full h-32 rounded-md"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(url, idx)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: 'none',
                  zIndex: 10,
                  transition: 'background-color 0.2s ease',
                }}
                onMouseOver={e =>
                  (e.currentTarget.style.backgroundColor = '#DC2626')
                }
                onMouseOut={e =>
                  (e.currentTarget.style.backgroundColor = '#EF4444')
                }
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VariantImgUpload;
