'use client';

import React, { useRef, useState } from 'react';
import { useUploadImageWithMetaMutation } from '@/redux/cloudinary/cloudinaryApi';
import type { ImageWithMeta } from '@/types/image-with-meta';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, Pencil } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadWithMetaProps {
  value: ImageWithMeta | null;
  onChange: (value: ImageWithMeta | null) => void;
  folder?: string;
  acceptedFormats?: string;
  maxSizeMb?: number;
  className?: string;
  /** Pre-fill metadata when uploading a new file (e.g. from main image for mobile variant) */
  defaultMetaForNewUpload?: Pick<ImageWithMeta, 'fileName' | 'title' | 'altText' | 'link'>;
}

export const ImageUploadWithMeta = ({
  value,
  onChange,
  folder = 'ewo-assets',
  acceptedFormats = 'image/png,image/jpg,image/jpeg,image/webp,image/avif',
  maxSizeMb = 5,
  className = '',
  defaultMetaForNewUpload,
}: ImageUploadWithMetaProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadImageWithMeta, { isLoading }] = useUploadImageWithMetaMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [link, setLink] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      return;
    }

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    setPendingFile(file);
    if (defaultMetaForNewUpload) {
      setFileName(defaultMetaForNewUpload.fileName || file.name);
      setTitle(defaultMetaForNewUpload.title || baseName);
      setAltText(defaultMetaForNewUpload.altText || defaultMetaForNewUpload.title || baseName);
      setLink(defaultMetaForNewUpload.link ?? '');
    } else {
      setFileName(file.name);
      setTitle(baseName);
      setAltText(baseName);
      setLink('');
    }
    setDialogOpen(true);
    e.target.value = '';
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setPendingFile(null);
    setFileName('');
    setTitle('');
    setAltText('');
    setLink('');
  };

  const handleUpload = async () => {
    if (!pendingFile) return;

    try {
      const res = await uploadImageWithMeta({
        file: pendingFile,
        fileName: fileName.trim() || pendingFile.name,
        title: title.trim(),
        altText: altText.trim() || title.trim() || fileName.trim(),
        folder,
      });

      if ('data' in res && res.data?.data) {
        const data = res.data.data as ImageWithMeta;
        onChange({
          ...data,
          link: link.trim() || undefined,
        });
        handleCloseDialog();
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleEditMeta = () => {
    if (value) {
      setFileName(value.fileName);
      setTitle(value.title);
      setAltText(value.altText);
      setLink(value.link ?? '');
      setPendingFile(null);
      setDialogOpen(true);
    }
  };

  const handleEditMetaSave = async () => {
    if (!value) return;

    onChange({
      ...value,
      fileName: fileName.trim() || value.fileName,
      title: title.trim(),
      altText: altText.trim() || title.trim() || value.fileName,
      link: link.trim() || undefined,
    });
    handleCloseDialog();
  };

  const isEditMode = !!value && !pendingFile;

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleFileSelect}
        className="hidden"
      />

      {value?.url ? (
        <div className="space-y-3">
          <div className="relative aspect-video w-full max-w-full rounded-lg overflow-hidden border bg-muted min-w-0">
            <Image
              src={value.url}
              alt={value.altText || value.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-xs">
              <p className="font-medium truncate">{value.fileName}</p>
              {value.title && <p className="truncate opacity-90">{value.title}</p>}
              {value.link && (
                <p className="truncate opacity-75 mt-1">Link: {value.link}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="shrink-0"
            >
              <Upload className="h-4 w-4 mr-1.5" />
              Replace
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEditMeta}
              className="shrink-0"
              title="Edit file name, title, alt text, and link"
            >
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit metadata
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          className="flex flex-col items-center justify-center w-full max-w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/5 hover:bg-muted/10 hover:border-muted-foreground/40 transition-colors cursor-pointer min-w-0"
          aria-label="Upload image"
        >
          <Upload className="h-4 w-4 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, WEBP, AVIF (max {maxSizeMb}MB)
          </p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit image metadata' : 'Set file name, title, alt text & link'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="img-fileName">File name</Label>
              <Input
                id="img-fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. hero-banner-desktop"
              />
              <p className="text-xs text-muted-foreground">
                Used for storage and rendering. Leave empty to use original.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="img-title">Title</Label>
              <Input
                id="img-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Image title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="img-altText">Alt text</Label>
              <Input
                id="img-altText"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Description for accessibility"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="img-link">Link (optional)</Label>
              <Input
                id="img-link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/shop, /about, etc."
              />
              <p className="text-xs text-muted-foreground">
                URL path to navigate when image is clicked
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCloseDialog} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={isEditMode ? handleEditMetaSave : handleUpload}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : isEditMode ? (
                'Save'
              ) : (
                'Upload'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
