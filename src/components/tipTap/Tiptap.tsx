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

import { useCallback } from 'react';

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
}: {
  value?: string;
  onChange: (value: string) => void;
}) => {
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
      }),
      // Configure additional extensions
      Color,
      TextStyle,
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
        autolink: true,
        defaultProtocol: 'https',
      }),
      // Table extensions
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      CustomTableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    autofocus: false,
    editable: true,
    immediatelyRender: false,
  });

  const addBlockquote = useCallback(() => {
    editor?.chain().focus().setBlockquote().run();
  }, [editor]);
  // console.log(value);
  return (
    <div className="p-6 border rounded-md max-w-none tip-tap-container">
      <MenuBar editor={editor} />
      <div className="mt-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;
