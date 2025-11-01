import React, { useEffect } from 'react';
import type { Tag } from 'react-tag-input';
import { WithContext as ReactTags, SEPARATORS } from 'react-tag-input';
import ErrorMsg from '../common/error-msg';

type IPropType = {
  categoryChildren: Tag[];
  setCategoryChildren: React.Dispatch<React.SetStateAction<Tag[]>>;
  default_value?: Tag[];
  error?: string;
};
const CategoryChildren = ({
  categoryChildren,
  setCategoryChildren,
  default_value,
  error,
}: IPropType) => {
  useEffect(() => {
    if (default_value && Array.isArray(default_value) && default_value.length > 0) {
      // Filter out any invalid tags and ensure text is a string
      const validTags = default_value.filter(
        tag => tag && typeof tag.text === 'string' && tag.text.trim().length > 0
      );
      if (validTags.length > 0) {
        setCategoryChildren(validTags);
      }
    }
  }, [default_value, setCategoryChildren]);

  const handleDelete = (index: number) => {
    setCategoryChildren(categoryChildren.filter((_, i) => i !== index));
  };

  const handleAddition = (tag: Tag) => {
    // Ensure tag has valid text before adding
    if (tag && tag.text && typeof tag.text === 'string' && tag.text.trim().length > 0) {
      setCategoryChildren([...categoryChildren, tag]);
    }
  };

  const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
    const newTags = categoryChildren.slice();
    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);
    setCategoryChildren(newTags);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Sub-Categories
        </label>
        <ReactTags
          tags={categoryChildren || []}
          separators={[SEPARATORS.ENTER, SEPARATORS.COMMA]}
          handleDelete={handleDelete}
          handleAddition={handleAddition}
          handleDrag={handleDrag}
          inputFieldPosition="bottom"
          placeholder="Enter sub-category name and press Enter or comma"
          allowDragDrop={true}
        />
        <p className="text-xs text-muted-foreground">
          Press Enter or comma to add new sub-categories. You can drag to reorder them.
        </p>
      </div>
      {error && (
        <div className="mt-2">
          <ErrorMsg msg={error} />
        </div>
      )}
    </div>
  );
};

export default CategoryChildren;
