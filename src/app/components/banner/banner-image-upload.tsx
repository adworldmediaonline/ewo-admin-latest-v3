import useUploadImage from '@/hooks/useUploadImg';
import Image from 'next/image';
import React, { useEffect } from 'react';
import upload_default from '../../../../public/assets/img/icons/upload.png';
import Loading from '../common/loading';
import UploadImage from '../products/add-product/upload-image';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

type BannerImageUploadProps = {
  setImage: React.Dispatch<React.SetStateAction<string>>;
  isSubmitted: boolean;
  image: string;
  setIsSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  imageType: 'desktop' | 'mobile';
  default_img?: string;
};

const BannerImageUpload = ({
  setImage,
  isSubmitted,
  image,
  setIsSubmitted,
  imageType,
  default_img,
}: BannerImageUploadProps) => {
  const { handleImageUpload, uploadData, isError, isLoading } =
    useUploadImage();
  const showDefaultImage = !uploadData && !isLoading && !isError && default_img;

  // Unique ID for this input
  const inputId = `${imageType}BannerImage`;

  const upload_img = isLoading ? (
    <div className="flex items-center justify-center py-8">
      <Loading loading={isLoading} spinner="scale" />
    </div>
  ) : uploadData?.data.url ? (
    <UploadImage
      file={{
        url: uploadData.data.url,
        id: uploadData.data.id,
      }}
      isCenter={true}
      setImgUrl={setImage}
    />
  ) : showDefaultImage ? (
    <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 bg-muted/5 flex items-center justify-center">
      <Image
        src={default_img}
        alt={`${imageType} banner image`}
        fill
        className="object-cover"
        sizes="128px"
      />
    </div>
  ) : (
    <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 bg-muted/5 flex items-center justify-center">
      <div className="text-center">
        <Image
          src={upload_default}
          alt="Upload placeholder"
          width={40}
          height={40}
          className="mx-auto mb-2 opacity-50"
        />
        <p className="text-xs text-muted-foreground">No image</p>
      </div>
    </div>
  );

  // set upload image
  useEffect(() => {
    if (isLoading) {
      setIsSubmitted(false);
    }
  }, [isLoading, setIsSubmitted]);

  useEffect(() => {
    if (uploadData && !isError && !isLoading) {
      setImage(uploadData.data.url);
    } else if (default_img) {
      setImage(default_img);
    }
  }, [default_img, uploadData, isError, isLoading, setImage]);

  return (
    <div className="space-y-3">
      <div className="text-center">
        {isSubmitted ? (
          <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 bg-muted/5 flex items-center justify-center">
            <div className="text-center">
              <Image
                src={upload_default}
                alt="Upload placeholder"
                width={40}
                height={40}
                className="mx-auto mb-2 opacity-50"
              />
              <p className="text-xs text-muted-foreground">No image</p>
            </div>
          </div>
        ) : (
          upload_img
        )}
      </div>

      <div className="space-y-2">
        <input
          onChange={handleImageUpload}
          type="file"
          name="image"
          id={inputId}
          accept="image/png,image/jpg,image/jpeg,image/webp"
          className="hidden"
        />
        <label htmlFor={inputId} className="w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 cursor-pointer"
            asChild
          >
            <span>
              <Upload className="h-4 w-4" />
              {uploadData?.data.url || showDefaultImage
                ? 'Change Image'
                : 'Upload Image'}
            </span>
          </Button>
        </label>
        <p className="text-xs text-center text-muted-foreground">
          Supported formats: PNG, JPG, JPEG, WEBP (Max 5MB)
        </p>
      </div>
    </div>
  );
};

export default BannerImageUpload;

