'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';
import { Column } from './column';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columnsBlock: {
      insertColumns: (cols: 2 | 3) => ReturnType;
      unsetColumns: () => ReturnType;
    };
  }
}

const buildColumn = (content?: JSONContent['content']) =>
  content ? { type: 'column', content } : { type: 'column', content: [{ type: 'paragraph' }] };

const buildColumnsBlock = (cols: 2 | 3) => {
  const columnNodes = Array.from({ length: cols }, () => buildColumn());
  return { type: 'columnsBlock', attrs: { cols }, content: columnNodes };
};

/**
 * ColumnsBlock - multi-column layout (2 or 3 columns).
 * Renders as CSS Grid. Responsive: stacks on mobile.
 */
export const ColumnsBlock = Node.create({
  name: 'columnsBlock',
  group: 'block',
  content: 'column{2,3}',
  isolating: true,
  selectable: true,

  addAttributes() {
    return {
      cols: {
        default: 2,
        parseHTML: (element: HTMLElement) => {
          const c = element.getAttribute('data-cols');
          return c ? parseInt(c, 10) : 2;
        },
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-cols': attributes.cols ?? 2,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: `div[data-type="${this.name}"]` }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const cols = node.attrs.cols ?? 2;
    const colsClass =
      cols === 3 ? 'more-details-cols-3' : 'more-details-cols-2';
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': this.name,
        'data-cols': cols,
        class: `more-details-columns-block ${colsClass}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertColumns:
        (cols: 2 | 3) =>
        ({ commands }) => {
          return commands.insertContent(buildColumnsBlock(cols));
        },
      unsetColumns:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const { $from } = selection;
          let depth = $from.depth;
          let pos = $from.pos;
          let found: { pos: number; node: { type: { name: string }; nodeSize: number; descendants: (fn: (n: unknown, pos: number, parent?: unknown) => void) => void } } | null = null;

          for (let i = depth; i > 0; i--) {
            const node = $from.node(i);
            if (node.type.name === 'columnsBlock') {
              pos = $from.before(i);
              found = { pos, node };
              break;
            }
          }

          if (!found || !dispatch) return false;

          const tr = state.tr;
          const { node } = found;
          const paragraphContent: unknown[] = [];
          node.descendants((n, _pos, parent) => {
            if ((parent as { type?: { name?: string } } | null)?.type?.name === 'column') {
              paragraphContent.push(n);
            }
          });

          const schema = state.schema;
          const from = found.pos;
          const to = found.pos + node.nodeSize;
          tr.delete(from, to);

          paragraphContent.reverse().forEach((n) => {
            tr.insert(from, n as Parameters<typeof tr.insert>[1]);
          });

          dispatch(tr);
          return true;
        },
    };
  },
});

export default ColumnsBlock;
