'use client';
import {
  useAddBannerMutation,
  useEditBannerMutation,
} from '@/redux/banner/bannerApi';
import { IAddBanner } from '@/types/banner-type';
import { notifyError, notifySuccess } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const useBannerSubmit = () => {
  const [desktopImg, setDesktopImg] = useState<string>('');
  const [mobileImg, setMobileImg] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const router = useRouter();

  // add banner mutation
  const [addBanner, { isLoading: isAdding }] = useAddBannerMutation();
  // edit banner mutation
  const [editBanner, { isLoading: isEditing }] = useEditBannerMutation();

  // react hook form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  // handle submit add banner
  const handleSubmitBanner = async (data: any) => {
    const bannerData: IAddBanner = {
      desktopImg,
      mobileImg,
      heading: data.heading,
      description: data.description,
      smallSubDescription: data.smallSubDescription || '',
      cta: {
        text: data.ctaText,
        link: data.ctaLink,
      },
      status,
      order: data.order ? Number(data.order) : 0,
    };

    if (!desktopImg) {
      return notifyError('Desktop image is required');
    }
    if (!mobileImg) {
      return notifyError('Mobile image is required');
    }

    try {
      const res = await addBanner(bannerData);
      if ('data' in res && res.data && 'success' in res.data) {
        notifySuccess('Banner added successfully');
        setIsSubmitted(true);
        reset();
        setDesktopImg('');
        setMobileImg('');
        router.push('/dashboard/super-admin/banner');
      } else {
        notifyError('Failed to add banner');
      }
    } catch (error) {
      notifyError('Something went wrong adding the banner');
    }
  };

  // handle submit edit banner
  const handleEditBanner = async (id: string, data: any) => {
    const bannerData: Partial<IAddBanner> = {
      desktopImg,
      mobileImg,
      heading: data.heading,
      description: data.description,
      smallSubDescription: data.smallSubDescription || '',
      cta: {
        text: data.ctaText,
        link: data.ctaLink,
      },
      status,
      order: data.order ? Number(data.order) : 0,
    };

    if (!desktopImg) {
      return notifyError('Desktop image is required');
    }
    if (!mobileImg) {
      return notifyError('Mobile image is required');
    }

    try {
      const res = await editBanner({ id, data: bannerData });
      if ('data' in res && res.data && 'success' in res.data) {
        notifySuccess('Banner updated successfully');
        router.push('/dashboard/super-admin/banner');
      } else {
        notifyError('Failed to update banner');
      }
    } catch (error) {
      notifyError('Something went wrong updating the banner');
    }
  };

  return {
    register,
    handleSubmit,
    setValue,
    errors,
    desktopImg,
    setDesktopImg,
    mobileImg,
    setMobileImg,
    status,
    setStatus,
    isSubmitted,
    setIsSubmitted,
    handleSubmitBanner,
    handleEditBanner,
    isAdding,
    isEditing,
  };
};

export default useBannerSubmit;

