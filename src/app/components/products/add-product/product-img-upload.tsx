import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUploadImageMutation } from '@/redux/cloudinary/cloudinaryApi';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

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
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [uploadImage, { data: uploadData, isError, isLoading }] =
    useUploadImageMutation();

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Start upload
      const formData = new FormData();
      formData.append('image', file);
      uploadImage(formData);

      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
    },
    [uploadImage]
  );

  // Handle input change
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle successful upload
  useEffect(() => {
    if (uploadData && !isError) {
      setImgUrl(uploadData.data.url);
      setPreviewUrl(null);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [uploadData, isError, setImgUrl]);

  // Handle default image
  useEffect(() => {
    if (default_img && initialLoad) {
      setImgUrl(default_img);
      setInitialLoad(false);
    }
  }, [default_img, initialLoad, setImgUrl]);

  // Handle upload error
  useEffect(() => {
    if (isError) {
      setPreviewUrl(null);
      setUploadProgress(0);
    }
  }, [isError]);

  const currentImageUrl = previewUrl || imgUrl;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all duration-300',
          isDragOver
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          currentImageUrl ? 'p-4' : 'p-8'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          onChange={handleImageUpload}
          type="file"
          name="image"
          id="product_img"
          className="hidden"
          accept="image/*"
        />

        {isLoading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-foreground">
                Uploading image...
              </p>
              <div className="w-full max-w-xs bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {uploadProgress}% complete
              </p>
            </div>
          </div>
        ) : currentImageUrl ? (
          // Image Preview
          <div className="space-y-4">
            <div className="relative group">
              <img
                src={currentImageUrl}
                alt="Product preview"
                className="w-full h-48 object-cover rounded-lg shadow-sm"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-lg" />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setImgUrl('');
                    setPreviewUrl(null);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {previewUrl && (
                <div className="absolute top-2 left-2">
                  <div className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    Preview
                  </div>
                </div>
              )}
            </div>

            <label
              htmlFor="product_img"
              className="flex items-center justify-center gap-2 p-3 bg-muted/50 hover:bg-muted rounded-lg cursor-pointer transition-colors group"
            >
              <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                Change image
              </span>
            </label>
          </div>
        ) : (
          // Upload Prompt
          <label
            htmlFor="product_img"
            className="flex flex-col items-center justify-center cursor-pointer text-center space-y-4"
          >
            <div
              className={cn(
                'h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300',
                isDragOver
                  ? 'bg-primary text-primary-foreground scale-110'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <ImageIcon className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">
                {isDragOver ? 'Drop your image here' : 'Upload product image'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Drag and drop an image here, or click to browse files. Supports
                JPG, PNG, WebP up to 5MB.
              </p>
            </div>

            <Button
              type="button"
              variant={isDragOver ? 'default' : 'outline'}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Choose Image
            </Button>
          </label>
        )}
      </div>

      {/* Error State */}
      {isError && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <span className="text-destructive">
            Failed to upload image. Please try again.
          </span>
        </div>
      )}

      {/* Success State */}
      {uploadData && !isError && !isLoading && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span className="text-green-700">Image uploaded successfully!</span>
        </div>
      )}

      {/* Helper Text */}
      {!currentImageUrl && !isLoading && (
        <p className="text-xs text-muted-foreground text-center">
          Recommended: 800×800px, high-quality image for best results
        </p>
      )}
    </div>
  );
};

export default ProductImgUpload;
