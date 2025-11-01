'use client';
import Wrapper from '@/layout/wrapper';
import EnhancedCouponArea from '../../../../components/coupon/enhanced-coupon-area';

export default function CouponPage() {
  return (
    <Wrapper>
      <div className="body-content px-8 py-8">
        <EnhancedCouponArea />
      </div>
    </Wrapper>
  );
}
