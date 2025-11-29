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
    setValue,
  } = useForm<IAddCoupon>();

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
        // Dates are already in ISO format from DateTimePicker (UTC)
        // Just pass them through - backend expects ISO strings
        startTime: data.startTime || undefined,
        endTime: data.endTime,

        // Discount Configuration - Parse as exact numbers
        discountType: data.discountType || 'percentage',
        discountPercentage: data.discountPercentage ? Number(data.discountPercentage) : undefined,
        discountAmount: data.discountAmount ? Number(data.discountAmount) : undefined,
        buyQuantity: data.buyQuantity ? Number(data.buyQuantity) : undefined,
        getQuantity: data.getQuantity ? Number(data.getQuantity) : undefined,

        // Usage Restrictions - Parse as exact numbers
        minimumAmount: data.minimumAmount ? Number(data.minimumAmount) : undefined,
        maximumAmount: data.maximumAmount ? Number(data.maximumAmount) : undefined,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
        usageLimitPerUser: data.usageLimitPerUser ? Number(data.usageLimitPerUser) : undefined,

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

      const res = await addCoupon({ ...coupon_data });
      if ('error' in res) {
        if (res.error && 'data' in res.error) {
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
        router.push('/dashboard/super-admin/coupon');
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
        // Dates are already in ISO format from DateTimePicker (UTC)
        // Just pass them through - backend expects ISO strings
        startTime: data.startTime || undefined,
        endTime: data.endTime,

        // Discount Configuration - Parse as exact numbers
        discountType: data.discountType || 'percentage',
        discountPercentage: data.discountPercentage ? Number(data.discountPercentage) : undefined,
        discountAmount: data.discountAmount ? Number(data.discountAmount) : undefined,
        buyQuantity: data.buyQuantity ? Number(data.buyQuantity) : undefined,
        getQuantity: data.getQuantity ? Number(data.getQuantity) : undefined,

        // Usage Restrictions - Parse as exact numbers
        minimumAmount: data.minimumAmount ? Number(data.minimumAmount) : undefined,
        maximumAmount: data.maximumAmount ? Number(data.maximumAmount) : undefined,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
        usageLimitPerUser: data.usageLimitPerUser ? Number(data.usageLimitPerUser) : undefined,

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

        // Status - always include status, default to 'active' if not provided
        // Make sure to explicitly set status even if it's 'inactive'
        status: data.status ? data.status : 'active',
        isPublic: data.isPublic !== false,
      };

      // Ensure status is always included in the update
      if (!coupon_data.status) {
        coupon_data.status = 'active';
      }

      const res = await editCoupon({ id, data: coupon_data });
      if ('error' in res) {
        if (res.error && 'data' in res.error) {
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
        router.push('/dashboard/super-admin/coupon');
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
    setValue,
  };
};

export default useCouponSubmit;
