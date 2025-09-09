import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Editor as TiptapEditor } from '@tiptap/react';
import { useCallback } from 'react';

// Icon components for better visual appearance
const BoldIcon = () => (
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
      d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
    />
  </svg>
);

const ItalicIcon = () => (
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
      d="M19 4h-9m4 16h-9M14 20l-10-16"
    />
  </svg>
);

const StrikeIcon = () => (
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
      d="M17.728 5.728l-1.414-1.414L12 8.586 7.686 4.314 6.272 5.728l4.314 4.314-4.314 4.314 1.414 1.414L12 11.414l4.314 4.314 1.414-1.414-4.314-4.314 4.314-4.314z"
    />
  </svg>
);

const CodeIcon = () => (
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
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  </svg>
);

const LinkIcon = () => (
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
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
);

const TableIcon = () => (
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
      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const ListIcon = () => (
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
      d="M4 6h16M4 10h16M4 14h16M4 18h16"
    />
  </svg>
);

const OrderedListIcon = () => (
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
      d="M7 7h.01M7 12h.01M7 17h.01M12 7h5M12 12h5M12 17h5"
    />
  </svg>
);

const QuoteIcon = () => (
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
      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
    />
  </svg>
);

const UndoIcon = () => (
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
      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
    />
  </svg>
);

const RedoIcon = () => (
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
      d="M21 10H11a8 8 0 00-8 8v2m10-10l-6 6m6-6l-6-6"
    />
  </svg>
);

const HeadingIcon = () => (
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
      d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4H5a1 1 0 00-1 1v16a1 1 0 001 1h2M7 4h10M7 20h10M17 4v16a1 1 0 001-1V5a1 1 0 00-1-1h-2M13 8H9m4 4H9m2 4H9"
    />
  </svg>
);

const MenuBar: React.FC<{ editor: TiptapEditor | null }> = ({ editor }) => {
  const setLink = useCallback(() => {
    if (!editor) {
      return;
    }
    const url = window.prompt('Enter URL:');

    if (url && url.trim()) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url.trim() })
        .run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border-b border-border bg-background/50 sticky top-0 z-10">
      <div className="flex flex-wrap items-center gap-1 p-2 overflow-x-auto">
        {/* Text Formatting Group */}
        <div className="flex items-center gap-1 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('bold')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Bold (Ctrl+B)"
          >
            <BoldIcon />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('italic')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Italic (Ctrl+I)"
          >
            <ItalicIcon />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('strike')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Strikethrough"
          >
            <StrikeIcon />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('code')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Inline Code"
          >
            <CodeIcon />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1"></div>

        {/* Headings Dropdown */}
        <div className="flex items-center gap-1 mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                  editor.isActive('heading')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title="Headings"
              >
                <HeadingIcon />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={editor.isActive('paragraph') ? 'bg-accent' : ''}
              >
                <span className="font-normal">Normal Text</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={
                  editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''
                }
              >
                <span className="text-lg font-bold">Heading 1</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  20px
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={
                  editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''
                }
              >
                <span className="text-base font-semibold">Heading 2</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  18px
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={
                  editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''
                }
              >
                <span className="text-sm font-semibold">Heading 3</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  16px
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 4 }).run()
                }
                className={
                  editor.isActive('heading', { level: 4 }) ? 'bg-accent' : ''
                }
              >
                <span className="text-sm font-medium">Heading 4</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  15px
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 5 }).run()
                }
                className={
                  editor.isActive('heading', { level: 5 }) ? 'bg-accent' : ''
                }
              >
                <span className="text-sm font-medium">Heading 5</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  14px
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 6 }).run()
                }
                className={
                  editor.isActive('heading', { level: 6 }) ? 'bg-accent' : ''
                }
              >
                <span className="text-sm font-medium">Heading 6</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  13px
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1"></div>

        {/* Lists and Structure Group */}
        <div className="flex items-center gap-1 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Bullet List"
          >
            <ListIcon />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Numbered List"
          >
            <OrderedListIcon />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('blockquote')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Quote"
          >
            <QuoteIcon />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1"></div>

        {/* Links and Advanced Group */}
        <div className="flex items-center gap-1 mr-2">
          <button
            type="button"
            onClick={setLink}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('link')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Add Link"
          >
            <LinkIcon />
          </button>
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Insert Table"
          >
            <TableIcon />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1"></div>

        {/* Undo/Redo Group */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <UndoIcon />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <RedoIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
