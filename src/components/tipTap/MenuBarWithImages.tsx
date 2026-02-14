'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Editor as TiptapEditor } from '@tiptap/react';
import { useCallback, useState } from 'react';
import { ImageUploadWithMeta } from '@/components/image-upload-with-meta/image-upload-with-meta';
import type { ImageWithMeta } from '@/types/image-with-meta';
import { Columns2, Columns3, ImageIcon as LayoutIcon, AlignHorizontalSpaceAround } from 'lucide-react';
import MenuBar from './MenuBar';

const ImageIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

interface MenuBarWithImagesProps {
  editor: TiptapEditor | null;
  folder?: string;
}

export const MenuBarWithImages = ({ editor, folder = 'ewo-assets/products' }: MenuBarWithImagesProps) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const handleInsertImage = useCallback(() => {
    setImageDialogOpen(true);
  }, []);

  const handleImageSelected = useCallback(
    (img: ImageWithMeta | null) => {
      if (!editor || !img?.url) return;
      editor
        .chain()
        .focus()
        .setImage({
          src: img.url,
          alt: img.altText || img.title || img.fileName,
          title: img.title || img.fileName,
        })
        .run();
      setImageDialogOpen(false);
    },
    [editor]
  );

  const selection = editor?.state?.selection;
  const isImageSelected =
    editor &&
    selection &&
    'node' in selection &&
    (selection as { node?: { type?: { name?: string } } }).node?.type?.name === 'image';

  const handleSetImageFloat = useCallback(
    (float: 'left' | 'right' | null) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .updateAttributes('image', {
          float,
          floatWidth: float ? '40%' : undefined,
        })
        .run();
    },
    [editor]
  );

  const imageButton = (
    <>
      <div className="w-px h-6 bg-border mx-1" />
      <button
        type="button"
        onClick={handleInsertImage}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
        title="Insert image (filename, alt text, title)"
        aria-label="Insert image"
      >
        <ImageIcon />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Layout options"
            aria-label="Layout options"
          >
            <LayoutIcon className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => editor?.chain().focus().insertColumns(2).run()}
          >
            <Columns2 className="w-4 h-4 mr-2" />
            2 columns
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor?.chain().focus().insertColumns(3).run()}
          >
            <Columns3 className="w-4 h-4 mr-2" />
            3 columns
          </DropdownMenuItem>
          {isImageSelected && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSetImageFloat('left')}>
                <AlignHorizontalSpaceAround className="w-4 h-4 mr-2" />
                Image float left (text wrap)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetImageFloat('right')}>
                <AlignHorizontalSpaceAround className="w-4 h-4 mr-2 rotate-180" />
                Image float right (text wrap)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetImageFloat(null)}>
                Remove float
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <>
      <MenuBar editor={editor} extraButtons={imageButton} />

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert image</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Upload an image with filename, title, and alt text. It will be inserted at the cursor position.
          </p>
          <ImageUploadWithMeta
            value={null}
            onChange={(img) => {
              if (img) {
                handleImageSelected(img);
              }
            }}
            folder={folder}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MenuBarWithImages;
