import React, { useEffect } from 'react';
import type { Tag } from 'react-tag-input';
import { WithContext as ReactTags, SEPARATORS } from 'react-tag-input';
import { cn } from '@/lib/utils';

type IPropType = {
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  default_value?: Tag[];
  className?: string;
};
const Tags = ({ tags, setTags, default_value, className = '' }: IPropType) => {
  useEffect(() => {
    if (default_value) {
      setTags(default_value);
    }
  }, [default_value, setTags]);

  const handleDelete = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleAddition = (tag: Tag) => {
    setTags([...tags, tag]);
  };

  const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
    const newTags = tags.slice();
    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);
    setTags(newTags);
  };

  return (
    <div className={cn('mb-5 tp-product-tags', className)}>
      <ReactTags
        tags={tags}
        separators={[SEPARATORS.ENTER, SEPARATORS.COMMA]}
        handleDelete={handleDelete}
        handleAddition={handleAddition}
        handleDrag={handleDrag}
        inputFieldPosition="bottom"
        placeholder="enter tags"
        allowDragDrop={true}
      />
      <em>press enter or comma to add new tag</em>
    </div>
  );
};

export default Tags;
