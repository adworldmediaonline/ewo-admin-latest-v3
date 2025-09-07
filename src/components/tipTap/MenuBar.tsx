import { Editor as TiptapEditor } from '@tiptap/react';
import { useCallback } from 'react';

const MenuBar: React.FC<{ editor: TiptapEditor | null }> = ({ editor }) => {
  const setLink = useCallback(() => {
    if (!editor) {
      return null;
    }
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor
        .chain()
        .focus()
        .extendMarkRange('hyperlink')
        .unsetHyperlink()
        .run();

      return;
    }

    // update link
    editor
      .chain()
      .focus()
      .extendMarkRange('hyperlink')
      .setHyperlink({ href: url })
      .run();
  }, [editor]);

  const editHyperLinkText = useCallback(() => {
    if (!editor) {
      return null;
    }
    const { from, to } = editor.view.state.selection;
    const selectedNode = editor.view.domAtPos(from - 1).node as HTMLElement;

    let link: HTMLAnchorElement | null = null;

    if (selectedNode?.nodeName === '#text') {
      link = (selectedNode.parentNode as HTMLElement)?.closest('a');
    } else {
      link = selectedNode?.closest('a');
    }

    const newText = window.prompt('Edit Hyperlink Text', link?.innerText);

    if (newText === null) return;

    editor.chain().focus().editHyperLinkText(newText);
  }, [editor]);

  const editHuperLinkHref = useCallback(() => {
    if (!editor) {
      return null;
    }
    const previousUrl = editor.getAttributes('link').href;

    const newURL = window.prompt('Edit Hyperlink URL', previousUrl);

    if (newURL === null) return;

    editor.chain().focus().editHyperLinkHref(newURL);
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-row flex-wrap items-center justify-start pb-2 border-b border-gray-300 toolbar">
      {/* table code start */}
      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        Insert table
      </button>
      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            // .insertContent(tableHTML, {
            //   parseOptions: {
            //     preserveWhitespace: false,
            //   },
            // })
            .run()
        }
      >
        Insert HTML table
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        disabled={!editor.can().addColumnBefore()}
      >
        Add column before
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        disabled={!editor.can().addColumnAfter()}
      >
        Add column after
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteColumn().run()}
        disabled={!editor.can().deleteColumn()}
      >
        Delete column
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().addRowBefore().run()}
        disabled={!editor.can().addRowBefore()}
      >
        Add row before
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().addRowAfter().run()}
        disabled={!editor.can().addRowAfter()}
      >
        Add row after
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteRow().run()}
        disabled={!editor.can().deleteRow()}
      >
        Delete row
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteTable().run()}
        disabled={!editor.can().deleteTable()}
      >
        Delete table
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().mergeCells().run()}
        disabled={!editor.can().mergeCells()}
      >
        Merge cells
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().splitCell().run()}
        disabled={!editor.can().splitCell()}
      >
        Split cell
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
        disabled={!editor.can().toggleHeaderColumn()}
      >
        ToggleHeaderColumn
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
        disabled={!editor.can().toggleHeaderRow()}
      >
        Toggle header row
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeaderCell().run()}
        disabled={!editor.can().toggleHeaderCell()}
      >
        Toggle header cell
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().mergeOrSplit().run()}
        disabled={!editor.can().mergeOrSplit()}
      >
        Merge or split
      </button>
      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .setCellAttribute('backgroundColor', '#FAF594')
            .run()
        }
        disabled={!editor.can().setCellAttribute('backgroundColor', '#FAF594')}
      >
        Set cell attribute
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().fixTables().run()}
        disabled={!editor.can().fixTables()}
      >
        Fix tables
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().goToNextCell().run()}
        disabled={!editor.can().goToNextCell()}
      >
        Go to next cell
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().goToPreviousCell().run()}
        disabled={!editor.can().goToPreviousCell()}
      >
        Go to previous cell
      </button>
      {/* table code end */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
      >
        strike
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={editor.isActive('code') ? 'is-active' : ''}
      >
        code
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
      >
        clear marks
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().clearNodes().run()}
      >
        clear nodes
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive('paragraph') ? 'is-active' : ''}
      >
        paragraph
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
      >
        h1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
      >
        h2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
      >
        h3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
      >
        h4
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
      >
        h5
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}
      >
        h6
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        bullet list
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
      >
        ordered list
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'is-active' : ''}
      >
        code block
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}
      >
        blockquote
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        horizontal rule
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHardBreak().run()}
      >
        hard break
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        undo
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        redo
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setColor('#958DF1').run()}
        className={
          editor.isActive('textStyle', { color: '#958DF1' }) ? 'is-active' : ''
        }
      >
        purple
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().unsetHyperlink().run()}
        disabled={!editor.isActive('hyperlink')}
      >
        unsetHyperlink
      </button>

      <button
        type="button"
        onClick={editHyperLinkText}
        disabled={!editor.isActive('hyperlink')}
      >
        edit hyperlink text
      </button>

      <button
        type="button"
        onClick={editHuperLinkHref}
        disabled={!editor.isActive('hyperlink')}
      >
        edit hyperlink href
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setHyperlink()}
      >
        set hyperlink
      </button>
    </div>
  );
};

export default MenuBar;
