'use client';

import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Column node - contains block content. Used only inside ColumnsBlock.
 * Content: paragraph, heading, image, blockquote, list, etc.
 */
export const Column = Node.create({
  name: 'column',
  group: 'column',
  content: 'block+',
  isolating: true,

  parseHTML() {
    return [{ tag: `div[data-type="${this.name}"]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': this.name,
        class: 'more-details-column',
      }),
      0,
    ];
  },
});

export default Column;
