import { Color } from '@tiptap/extension-color';
import { Link } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import MenuBar from './MenuBar';

import { useCallback, useEffect, useState } from 'react';

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      backgroundColor: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-background-color'),
        renderHTML: (attributes: any) => {
          return {
            'data-background-color': attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
    };
  },
});

const Tiptap = ({
  value,
  onChange,
  placeholder = 'Start writing your product description...',
  limit = 5000,
  showCharacterCount = true,
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  limit?: number;
  showCharacterCount?: boolean;
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      // Configure StarterKit with specific settings
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        heading: {
          levels: [1, 2, 3],
        },
      }),
      // Configure additional extensions
      Color,
      TextStyle,
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
        autolink: true,
        defaultProtocol: 'https',
        validate: href => /^https?:\/\//.test(href),
      }),
      // Table extensions
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
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onChange(html);

      // Update word and character count
      setCharacterCount(text.length);
      setWordCount(
        text
          .trim()
          .split(/\s+/)
          .filter(word => word.length > 0).length
      );
    },
    autofocus: false,
    editable: true,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[200px]',
        'data-placeholder': placeholder,
      },
    },
  });

  const addBlockquote = useCallback(() => {
    editor?.chain().focus().setBlockquote().run();
  }, [editor]);

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="p-6 border rounded-md max-w-none tip-tap-container animate-pulse">
        <div className="h-8 bg-muted rounded mb-4"></div>
        <div className="min-h-[200px] bg-muted rounded"></div>
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="relative group">
      {/* Editor Container */}
      <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200">
        <MenuBar editor={editor} />
        <div className="relative">
          <EditorContent
            editor={editor}
            className="min-h-[200px] focus:outline-none"
          />
        </div>

        {/* Character/Word Count & Status */}
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

      {/* Status Indicators */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {editor.isActive('bold') && (
          <div
            className="w-2 h-2 bg-primary rounded-full"
            title="Bold active"
          />
        )}
        {editor.isActive('italic') && (
          <div
            className="w-2 h-2 bg-primary rounded-full"
            title="Italic active"
          />
        )}
        {editor.isActive('link') && (
          <div
            className="w-2 h-2 bg-primary rounded-full"
            title="Link active"
          />
        )}
      </div>
    </div>
  );
};

export default Tiptap;
