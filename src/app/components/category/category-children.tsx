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
    if (default_value) {
      setCategoryChildren(default_value);
    }
  }, [default_value, setCategoryChildren]);

  const handleDelete = (index: number) => {
    setCategoryChildren(categoryChildren.filter((_, i) => i !== index));
  };

  const handleAddition = (tag: Tag) => {
    setCategoryChildren([...categoryChildren, tag]);
  };

  const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
    const newTags = categoryChildren.slice();
    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);
    setCategoryChildren(newTags);
  };

  return (
    <div className="mb-6">
      <p className="mb-0 text-base text-black">Children</p>
      <ReactTags
        tags={categoryChildren}
        separators={[SEPARATORS.ENTER, SEPARATORS.COMMA]}
        handleDelete={handleDelete}
        handleAddition={handleAddition}
        handleDrag={handleDrag}
        inputFieldPosition="bottom"
        placeholder="enter children"
        allowDragDrop={true}
      />
      <em>press enter or comma to add new children</em>
      {error && <ErrorMsg msg={error} />}
    </div>
  );
};

export default CategoryChildren;
