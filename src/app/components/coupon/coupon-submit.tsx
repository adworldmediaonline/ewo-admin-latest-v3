'use client';
import useCouponSubmit from '@/hooks/useCouponSubmit';
import EnhancedCouponForm from '@/app/components/coupon/enhanced-coupon-form';

const CouponSubmit = () => {
  const {
    handleCouponSubmit,
    errors,
    handleSubmit,
    isSubmitted,
    logo,
    register,
    setIsSubmitted,
    setLogo,
    control,
  } = useCouponSubmit();

  return (
    <EnhancedCouponForm
      onSubmit={handleCouponSubmit}
      isSubmitted={isSubmitted}
      setIsSubmitted={setIsSubmitted}
      logo={logo}
      setLogo={setLogo}
    />
  );
};

export default CouponSubmit;

