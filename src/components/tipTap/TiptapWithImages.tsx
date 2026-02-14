'use client';

import { Color } from '@tiptap/extension-color';
import { Link } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import MenuBarWithImages from './MenuBarWithImages';
import { Column, ColumnsBlock, ImageWithFloat } from './extensions';

import { useEffect, useState } from 'react';

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      backgroundColor: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-background-color'),
        renderHTML: (attributes: Record<string, unknown>) => {
          return {
            'data-background-color': attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
    };
  },
});

interface TiptapWithImagesProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  limit?: number;
  showCharacterCount?: boolean;
  compact?: boolean;
  /** Cloudinary folder for uploaded images */
  imageFolder?: string;
}

const TiptapWithImages = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  limit = 50000,
  showCharacterCount = true,
  compact = false,
  imageFolder = 'ewo-assets/products',
}: TiptapWithImagesProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Color,
      TextStyle,
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
        autolink: true,
        defaultProtocol: 'https',
        validate: (href) => /^https?:\/\//.test(href),
      }),
      Column,
      ColumnsBlock,
      ImageWithFloat.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader,
      CustomTableCell,
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      const text = ed.getText();
      onChange(html);
      setCharacterCount(text.length);
      setWordCount(
        text
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length
      );
    },
    autofocus: false,
    editable: true,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `focus:outline-none ${compact ? 'min-h-[120px]' : 'min-h-[200px]'}`,
        'data-placeholder': placeholder,
      },
    },
  });

  if (!isMounted) {
    return (
      <div className="p-6 border rounded-md max-w-none tip-tap-container animate-pulse">
        <div className="h-8 bg-muted rounded mb-4" />
        <div className="min-h-[200px] bg-muted rounded" />
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="relative group">
      <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200">
        <MenuBarWithImages editor={editor} folder={imageFolder} />
        <div className="relative px-3 pb-3 prose prose-sm max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto more-details-editor">
          <EditorContent
            editor={editor}
            className={
              compact
                ? 'min-h-[120px] focus:outline-none'
                : 'min-h-[200px] focus:outline-none'
            }
          />
        </div>

        {showCharacterCount && (
          <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>{wordCount} words</span>
              <span>
                {characterCount}/{limit} characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              {characterCount > limit * 0.9 && (
                <span className="text-destructive font-medium">
                  {limit - characterCount} remaining
                </span>
              )}
              {characterCount > limit && (
                <span className="text-destructive font-medium">
                  Exceeded by {characterCount - limit}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TiptapWithImages;
