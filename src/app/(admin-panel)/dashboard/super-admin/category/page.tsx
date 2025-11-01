import CategoryListArea from '@/app/components/category/category-list-area';
import Wrapper from '@/layout/wrapper';

const CategoryPage = () => {
  return (
    <Wrapper>
      <div className="body-content px-8 py-8">
        <CategoryListArea />
      </div>
    </Wrapper>
  );
};

export default CategoryPage;
