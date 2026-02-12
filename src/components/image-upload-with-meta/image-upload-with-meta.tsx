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
}

export const ImageUploadWithMeta = ({
  value,
  onChange,
  folder = 'ewo-assets',
  acceptedFormats = 'image/png,image/jpg,image/jpeg,image/webp,image/avif',
  maxSizeMb = 5,
  className = '',
}: ImageUploadWithMetaProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadImageWithMeta, { isLoading }] = useUploadImageWithMetaMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      return;
    }

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    setPendingFile(file);
    setFileName(file.name);
    setTitle(baseName);
    setAltText(baseName);
    setDialogOpen(true);
    e.target.value = '';
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setPendingFile(null);
    setFileName('');
    setTitle('');
    setAltText('');
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
        onChange(res.data.data as ImageWithMeta);
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
          <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border bg-muted">
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
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Replace
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEditMeta}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit name, title, alt text
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          className="flex flex-col items-center justify-center w-full max-w-md aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/5 hover:bg-muted/10 hover:border-muted-foreground/40 transition-colors cursor-pointer"
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
              {isEditMode ? 'Edit image metadata' : 'Set file name, title & alt text'}
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
