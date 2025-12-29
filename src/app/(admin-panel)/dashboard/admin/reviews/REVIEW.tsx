import ReviewListArea from '@/app/components/products/review-products/review-list-area';
import Wrapper from '@/layout/wrapper';

const ReviewsPage = () => {
  return (
    <Wrapper>
      <div className="body-content px-8 py-8">
        <ReviewListArea />
      </div>
    </Wrapper>
  );
};

export default ReviewsPage;
