import {
  useAddCouponMutation,
  useEditCouponMutation,
} from '@/redux/coupon/couponApi';
import { IAddCoupon } from '@/types/coupon';
import { notifyError, notifySuccess } from '@/utils/toast';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const useCouponSubmit = () => {
  const [logo, setLogo] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  const [editId, setEditId] = useState<string>('');
  const router = useRouter();

  // add coupon
  const [addCoupon, {}] = useAddCouponMutation();
  // edit coupon
  const [editCoupon, {}] = useEditCouponMutation();
  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm();

  useEffect(() => {
    if (!openSidebar) {
      setLogo('');
      reset();
    }
  }, [openSidebar, reset]);

  // Enhanced submit handler for new coupon form
  const handleCouponSubmit = async (data: IAddCoupon) => {
    try {
      // Prepare coupon data with the enhanced structure
      const coupon_data = {
        logo: logo,
        title: data.title,
        description: data.description,
        couponCode: data.couponCode,
        startTime: data.startTime
          ? dayjs(data.startTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          : undefined,
        endTime: dayjs(data.endTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),

        // Discount Configuration
        discountType: data.discountType || 'percentage',
        discountPercentage: data.discountPercentage,
        discountAmount: data.discountAmount,
        buyQuantity: data.buyQuantity,
        getQuantity: data.getQuantity,

        // Usage Restrictions
        minimumAmount: data.minimumAmount,
        maximumAmount: data.maximumAmount,
        usageLimit: data.usageLimit,
        usageLimitPerUser: data.usageLimitPerUser,

        // Product/Category Restrictions
        applicableType: data.applicableType || 'all',
        productType: data.productType,
        applicableProducts: data.applicableProducts,
        applicableCategories: data.applicableCategories,
        applicableBrands: data.applicableBrands,

        // User Restrictions
        userRestrictions: data.userRestrictions,

        // Advanced Settings
        stackable: data.stackable,
        priority: data.priority,

        // Status
        status: data.status || 'active',
        isPublic: data.isPublic !== false,
      };

      console.log('Submitting coupon data:', coupon_data);

      const res = await addCoupon({ ...coupon_data });
      if ('error' in res) {
        if ('data' in res.error) {
          const errorData = res.error.data as {
            message?: string;
            errorMessages?: Array<{ path: string; message: string }>;
          };
          if (
            errorData.errorMessages &&
            Array.isArray(errorData.errorMessages)
          ) {
            // Handle validation errors
            const errorMsg = errorData.errorMessages
              .map(err => `${err.path}: ${err.message}`)
              .join(', ');
            return notifyError(errorMsg);
          } else if (typeof errorData.message === 'string') {
            return notifyError(errorData.message);
          }
        }
        return notifyError('Failed to create coupon');
      } else {
        notifySuccess('Coupon added successfully');
        setIsSubmitted(true);
        setLogo('');
        setOpenSidebar(false);
        reset();
      }
    } catch (error) {
      console.log('Coupon submission error:', error);
      notifyError('Something went wrong');
    }
  };

  // Enhanced submit handler for editing coupon
  const handleSubmitEditCoupon = async (data: IAddCoupon, id: string) => {
    try {
      // Prepare coupon data with the enhanced structure (same as add coupon)
      const coupon_data = {
        logo: logo,
        title: data.title,
        description: data.description,
        couponCode: data.couponCode,
        startTime: data.startTime
          ? dayjs(data.startTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          : undefined,
        endTime: dayjs(data.endTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),

        // Discount Configuration
        discountType: data.discountType || 'percentage',
        discountPercentage: data.discountPercentage,
        discountAmount: data.discountAmount,
        buyQuantity: data.buyQuantity,
        getQuantity: data.getQuantity,

        // Usage Restrictions
        minimumAmount: data.minimumAmount,
        maximumAmount: data.maximumAmount,
        usageLimit: data.usageLimit,
        usageLimitPerUser: data.usageLimitPerUser,

        // Product/Category Restrictions
        applicableType: data.applicableType || 'all',
        productType: data.productType,
        applicableProducts: data.applicableProducts,
        applicableCategories: data.applicableCategories,
        applicableBrands: data.applicableBrands,

        // User Restrictions
        userRestrictions: data.userRestrictions,

        // Advanced Settings
        stackable: data.stackable,
        priority: data.priority,

        // Status
        status: data.status || 'active',
        isPublic: data.isPublic !== false,
      };

      console.log('Updating coupon data:', coupon_data);

      const res = await editCoupon({ id, data: coupon_data });
      if ('error' in res) {
        if ('data' in res.error) {
          const errorData = res.error.data as {
            message?: string;
            errorMessages?: Array<{ path: string; message: string }>;
          };
          if (
            errorData.errorMessages &&
            Array.isArray(errorData.errorMessages)
          ) {
            // Handle validation errors
            const errorMsg = errorData.errorMessages
              .map(err => `${err.path}: ${err.message}`)
              .join(', ');
            return notifyError(errorMsg);
          } else if (typeof errorData.message === 'string') {
            return notifyError(errorData.message);
          }
        }
        return notifyError('Failed to update coupon');
      } else {
        notifySuccess('Coupon updated successfully');
        router.push('/coupon');
        setIsSubmitted(true);
        reset();
      }
    } catch (error) {
      console.log('Coupon update error:', error);
      notifyError('Something went wrong');
    }
  };

  return {
    handleCouponSubmit,
    isSubmitted,
    setIsSubmitted,
    logo,
    setLogo,
    register,
    handleSubmit,
    errors,
    openSidebar,
    setOpenSidebar,
    control,
    handleSubmitEditCoupon,
    setEditId,
  };
};

export default useCouponSubmit;
