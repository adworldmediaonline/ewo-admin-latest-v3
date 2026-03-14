import ReviewListArea from '@/app/components/reviews/review-list-area';
import Wrapper from '@/layout/wrapper';

export default function ReviewsPage() {
  return (
    <Wrapper>
      <div className="body-content px-8 py-8">
        <ReviewListArea />
      </div>
    </Wrapper>
  );
}
