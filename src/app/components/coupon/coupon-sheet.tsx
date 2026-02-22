'use client';

import { useState, useEffect } from 'react';
import {
  useAddCouponMutation,
  useEditCouponMutation,
} from '@/redux/coupon/couponApi';
import { IAddCoupon, ICoupon } from '@/types/coupon';
import { notifyError, notifySuccess } from '@/utils/toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import EnhancedCouponForm from './enhanced-coupon-form';

interface CouponSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCoupon: ICoupon | null;
  onSuccess?: () => void;
}

function buildCouponData(data: IAddCoupon, logo: string) {
  return {
    logo,
    title: data.title,
    description: data.description,
    couponCode: data.couponCode,
    startTime: data.startTime || undefined,
    endTime: data.endTime,
    discountType: data.discountType || 'percentage',
    discountPercentage: data.discountPercentage ? Number(data.discountPercentage) : undefined,
    discountAmount: data.discountAmount ? Number(data.discountAmount) : undefined,
    buyQuantity: data.buyQuantity ? Number(data.buyQuantity) : undefined,
    getQuantity: data.getQuantity ? Number(data.getQuantity) : undefined,
    minimumAmount: data.minimumAmount ? Number(data.minimumAmount) : undefined,
    maximumAmount: data.maximumAmount ? Number(data.maximumAmount) : undefined,
    usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
    usageLimitPerUser: data.usageLimitPerUser ? Number(data.usageLimitPerUser) : undefined,
    applicableType: data.applicableType || 'all',
    productType: data.productType,
    applicableProducts: data.applicableProducts,
    applicableCategories: data.applicableCategories,
    applicableBrands: data.applicableBrands,
    userRestrictions: data.userRestrictions,
    stackable: data.stackable,
    priority: data.priority,
    status: data.status || 'active',
    isPublic: data.isPublic !== false,
    allowAutoApply: (data as IAddCoupon & { allowAutoApply?: boolean }).allowAutoApply ?? true,
    referralCode: (data as IAddCoupon & { referralCode?: string }).referralCode || undefined,
  };
}

export default function CouponSheet({
  open,
  onOpenChange,
  editingCoupon,
  onSuccess,
}: CouponSheetProps) {
  const [logo, setLogo] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [addCoupon, { isLoading: isAdding }] = useAddCouponMutation();
  const [editCoupon, { isLoading: isEditing }] = useEditCouponMutation();

  const isEdit = !!editingCoupon;
  const isSaving = isAdding || isEditing;

  useEffect(() => {
    if (open) {
      setLogo(editingCoupon?.logo || '');
      setIsSubmitted(false);
    }
  }, [open, editingCoupon?.logo]);

  const defaultValues: Partial<ICoupon> | undefined = editingCoupon
    ? {
        title: editingCoupon.title,
        description: editingCoupon.description,
        logo: editingCoupon.logo,
        couponCode: editingCoupon.couponCode,
        startTime: editingCoupon.startTime,
        endTime: editingCoupon.endTime,
        discountType: editingCoupon.discountType,
        discountPercentage: editingCoupon.discountPercentage,
        discountAmount: editingCoupon.discountAmount,
        buyQuantity: editingCoupon.buyQuantity,
        getQuantity: editingCoupon.getQuantity,
        minimumAmount: editingCoupon.minimumAmount ?? 0,
        maximumAmount: editingCoupon.maximumAmount ?? 0,
        usageLimit: editingCoupon.usageLimit,
        usageLimitPerUser: editingCoupon.usageLimitPerUser,
        applicableType: editingCoupon.applicableType,
        applicableProducts: editingCoupon.applicableProducts,
        applicableCategories: editingCoupon.applicableCategories,
        applicableBrands: editingCoupon.applicableBrands,
        stackable: editingCoupon.stackable,
        priority: editingCoupon.priority,
        status: editingCoupon.status,
        isPublic: editingCoupon.isPublic,
        userRestrictions: editingCoupon.userRestrictions,
        allowAutoApply: (editingCoupon as ICoupon & { allowAutoApply?: boolean }).allowAutoApply ?? true,
        referralCode: (editingCoupon as ICoupon & { referralCode?: string }).referralCode ?? '',
      }
    : undefined;

  const handleSubmit = async (data: IAddCoupon) => {
    try {
      const couponData = buildCouponData(data, logo);

      if (isEdit && editingCoupon) {
        const res = await editCoupon({ id: editingCoupon._id, data: couponData });
        if ('error' in res) {
          const err = res.error as { data?: { message?: string } };
          return notifyError(err?.data?.message || 'Failed to update coupon');
        }
        notifySuccess('Coupon updated successfully');
      } else {
        const res = await addCoupon(couponData);
        if ('error' in res) {
          const err = res.error as { data?: { message?: string } };
          return notifyError(err?.data?.message || 'Failed to create coupon');
        }
        notifySuccess('Coupon added successfully');
      }

      setIsSubmitted(true);
      setLogo('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      notifyError('Something went wrong');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-2xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Coupon' : 'Add Coupon'}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <EnhancedCouponForm
            key={editingCoupon?._id ?? 'new'}
            onSubmit={handleSubmit}
            isSubmitted={isSubmitted}
            setIsSubmitted={setIsSubmitted}
            logo={logo}
            setLogo={setLogo}
            defaultValues={defaultValues}
            isEdit={isEdit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
