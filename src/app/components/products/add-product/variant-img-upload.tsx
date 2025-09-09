import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useDeleteCloudinaryImgMutation,
  useUploadImageMultipleMutation,
} from '@/redux/cloudinary/cloudinaryApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

type IPropType = {
  formData: string[];
  setFormData: React.Dispatch<React.SetStateAction<string[]>>;
  setImageURLs: React.Dispatch<React.SetStateAction<string[]>>;
  isSubmitted: boolean;
};

const MAX_IMAGES = 10;

// Types for enhanced functionality
interface UploadItem {
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
}

const VariantImgUpload = ({
  setFormData,
  formData,
  setImageURLs,
  isSubmitted,
}: IPropType) => {
  const [uploadImages, { data: uploadData, isError, isLoading }] =
    useUploadImageMultipleMutation();
  const [deleteImage] = useDeleteCloudinaryImgMutation();

  // Enhanced state management
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingItems, setUploadingItems] = useState<UploadItem[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  // Enhanced file handling
  const handleFileSelect = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      // Validate file types
      const invalidFiles = fileArray.filter(
        file => !file.type.startsWith('image/')
      );
      if (invalidFiles.length > 0) {
        setLastError('Please select only image files (JPG, PNG, WebP)');
        return;
      }

      // Check total limit
      const totalImages =
        formData.length + uploadingItems.length + fileArray.length;
      if (totalImages > MAX_IMAGES) {
        setLastError(
          `You can only upload up to ${MAX_IMAGES} images in total. Currently: ${
            formData.length + uploadingItems.length
          }`
        );
        return;
      }

      // Create upload items with previews
      const newUploadItems: UploadItem[] = fileArray.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'uploading' as const,
      }));

      setUploadingItems(prev => [...prev, ...newUploadItems]);
      setLastError(null);

      // Start upload process
      const uploadFormData = new FormData();
      fileArray.forEach(file => {
        uploadFormData.append('images', file);
      });

      try {
        const response = await uploadImages(uploadFormData).unwrap();
        if (response.success && response.data) {
          const newUrls = response.data.map((item: any) => item.url);
          setFormData(prevUrls => [...prevUrls, ...newUrls]);
          setImageURLs(prevUrls => [...prevUrls, ...newUrls]);

          // Update upload items status
          setUploadingItems(prev =>
            prev.map(item => ({
              ...item,
              status: 'completed' as const,
              progress: 100,
            }))
          );

          setLastSuccess(
            `Successfully uploaded ${fileArray.length} image${
              fileArray.length > 1 ? 's' : ''
            }`
          );

          // Clear success message after 3 seconds
          setTimeout(() => setLastSuccess(null), 3000);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        setLastError('Failed to upload images. Please try again.');
        setUploadingItems(prev =>
          prev.map(item => ({
            ...item,
            status: 'error' as const,
          }))
        );
      }

      // Clear uploading items after 2 seconds
      setTimeout(() => {
        setUploadingItems([]);
      }, 2000);
    },
    [
      formData.length,
      uploadingItems.length,
      uploadImages,
      setFormData,
      setImageURLs,
    ]
  );

  // Handle input change
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
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
        handleFileSelect(files);
      }
    },
    [handleFileSelect]
  );

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

  const totalImages = formData.length + uploadingItems.length;
  const canUploadMore = totalImages < MAX_IMAGES;

  return (
    <div className="space-y-4">
      {/* Upload Statistics */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <ImageIcon className="h-3 w-3" />
            {totalImages} / {MAX_IMAGES}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {canUploadMore ? 'Ready to upload' : 'Maximum reached'}
          </span>
        </div>
        {formData.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              formData.forEach((url, idx) => handleRemoveImage(url, idx));
            }}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Upload Area */}
      {canUploadMore && (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg transition-all duration-300',
            isDragOver
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
            'p-8'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            onChange={handleImageUpload}
            type="file"
            name="images"
            id="variant_images"
            className="hidden"
            multiple
            accept="image/*"
          />

          <label
            htmlFor="variant_images"
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
              <Upload className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">
                {isDragOver ? 'Drop your images here' : 'Upload variant images'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Drag and drop multiple images here, or click to browse files.
                Supports JPG, PNG, WebP up to 5MB each.
              </p>
            </div>

            <Button
              type="button"
              variant={isDragOver ? 'default' : 'outline'}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Choose Images
            </Button>
          </label>
        </div>
      )}

      {/* Error Message */}
      {lastError && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <span className="text-destructive">{lastError}</span>
        </div>
      )}

      {/* Success Message */}
      {lastSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span className="text-green-700">{lastSuccess}</span>
        </div>
      )}

      {/* Image Grid */}
      {(formData.length > 0 || uploadingItems.length > 0) && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">
            Uploaded Images
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {/* Uploading Items */}
            {uploadingItems.map((item, idx) => (
              <div key={`uploading-${idx}`} className="relative group">
                <img
                  src={item.preview}
                  alt={`Uploading ${item.file.name}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-primary/20"
                />

                {/* Progress Overlay */}
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    {item.status === 'uploading' && (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin text-white mx-auto" />
                        <span className="text-xs text-white font-medium">
                          Uploading...
                        </span>
                      </>
                    )}
                    {item.status === 'completed' && (
                      <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="h-6 w-6 text-red-400 mx-auto" />
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 rounded-b-lg overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Uploaded Images */}
            {formData.map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={`Variant ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-muted hover:border-primary/50 transition-all duration-200"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 rounded-lg" />

                {/* Remove Button */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveImage(url, idx)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {/* Image Index */}
                <div className="absolute top-1 left-1">
                  <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
                    {idx + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          {canUploadMore
            ? `You can upload up to ${MAX_IMAGES - totalImages} more image${
                MAX_IMAGES - totalImages !== 1 ? 's' : ''
              }`
            : 'Maximum number of images reached'}
        </p>
      </div>
    </div>
  );
};

export default VariantImgUpload;
