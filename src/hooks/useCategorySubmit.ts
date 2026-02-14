import {
  useAddCategoryMutation,
  useEditCategoryMutation,
} from '@/redux/category/categoryApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Tag } from 'react-tag-input';
import type { ImageWithMeta } from '@/types/image-with-meta';
import type { ShowcaseGroup } from '@/app/components/category/category-showcase-groups';
import type { BannerDisplayScope } from '@/app/components/category/category-banner-display-settings';
import type { BannerContentClassesByScope } from '@/types/category-type';

const useCategorySubmit = () => {
  const [categoryImg, setCategoryImg] = useState<ImageWithMeta | null>(null);
  const [categoryBanner, setCategoryBanner] = useState<ImageWithMeta | null>(null);
  const [bannerDisplayScope, setBannerDisplayScope] =
    useState<BannerDisplayScope>('all');
  const [bannerDisplayChildren, setBannerDisplayChildren] = useState<string[]>(
    []
  );
  const [bannerContentActive, setBannerContentActive] = useState<boolean>(false);
  const [bannerContentDisplayScope, setBannerContentDisplayScope] =
    useState<BannerDisplayScope>('all');
  const [bannerContentDisplayChildren, setBannerContentDisplayChildren] =
    useState<string[]>([]);
  const [bannerTitle, setBannerTitle] = useState<string>('');
  const [bannerDescription, setBannerDescription] = useState<string>('');
  const [bannerContentClassesByScope, setBannerContentClassesByScope] =
    useState<BannerContentClassesByScope>({ parent: null, children: {} });
  const [showcaseGroups, setShowcaseGroups] = useState<ShowcaseGroup[]>([]);
  const [parent, setParent] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [categoryChildren, setCategoryChildren] = useState<Tag[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const router = useRouter();
  // add
  const [
    addCategory,
    { data: categoryData, isError, isLoading, error: addCateErr },
  ] = useAddCategoryMutation();
  // edit
  const [
    editCategory,
    {
      data: editCateData,
      isError: editErr,
      isLoading: editLoading,
      error: editCateErr,
    },
  ] = useEditCategoryMutation();

  // react hook form
  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  //handleSubmitCategory
  const handleSubmitCategory = async (data: any) => {
    try {
      const category_data = {
        image: categoryImg ?? undefined,
        img: categoryImg?.url ?? undefined,
        banner: categoryBanner ?? undefined,
        bannerDisplayScope,
        bannerDisplayChildren,
        bannerContentActive,
        bannerContentDisplayScope,
        bannerContentDisplayChildren,
        bannerTitle: bannerTitle.trim() || '',
        bannerDescription: bannerDescription.trim() || '',
        bannerContentClassesByScope: bannerContentClassesByScope,
        showcaseGroups: showcaseGroups.filter(
          (g) => g.children && g.children.length > 0
        ),
        parent: data?.parent,
        description: data?.description,
        children: categoryChildren.map(tag => tag.text),
      };
      const res = await addCategory({ ...category_data });
      if ('error' in res) {
        if (res.error && 'data' in res.error) {
          const errorData = res.error.data as { message?: string };
          if (typeof errorData.message === 'string') {
            return notifyError(errorData.message);
          }
        }
      } else {
        notifySuccess('Category added successfully');
        setIsSubmitted(true);
        reset();
        setCategoryChildren([] as Tag[]);
        setCategoryImg(null);
        setCategoryBanner(null);
        setBannerDisplayScope('all');
        setBannerDisplayChildren([]);
        setBannerContentActive(false);
        setBannerContentDisplayScope('all');
        setBannerContentDisplayChildren([]);
        setBannerTitle('');
        setBannerDescription('');
        setBannerContentClassesByScope({ parent: null, children: {} });
        setShowcaseGroups([]);
        router.push('/dashboard/super-admin/category');
      }
    } catch (error) {
      console.log(error);
      notifyError('Something went wrong');
    }
  };
  //handle Submit edit Category
  const handleSubmitEditCategory = async (data: any, id: string) => {
    try {
      const category_data = {
        image: categoryImg ?? undefined,
        img: categoryImg?.url ?? undefined,
        banner: categoryBanner ?? undefined,
        bannerDisplayScope,
        bannerDisplayChildren,
        bannerContentActive,
        bannerContentDisplayScope,
        bannerContentDisplayChildren,
        bannerTitle: bannerTitle.trim() || '',
        bannerDescription: bannerDescription.trim() || '',
        bannerContentClassesByScope: bannerContentClassesByScope,
        showcaseGroups: showcaseGroups.filter(
          (g) => g.children && g.children.length > 0
        ),
        parent: data?.parent,
        description: data?.description,
        children: categoryChildren.map(tag => tag.text),
      };
      const res = await editCategory({ id, data: category_data });
      if ('error' in res) {
        if (res.error && 'data' in res.error) {
          const errorData = res.error.data as { message?: string };
          if (typeof errorData.message === 'string') {
            return notifyError(errorData.message);
          }
        }
      } else {
        notifySuccess('Category update successfully');
        router.push('/dashboard/super-admin/category');
        setIsSubmitted(true);
        reset();
      }
    } catch (error) {
      console.log(error);
      notifyError('Something went wrong');
    }
  };

  return {
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    control,
    categoryImg,
    setCategoryImg,
    categoryBanner,
    setCategoryBanner,
    bannerDisplayScope,
    setBannerDisplayScope,
    bannerDisplayChildren,
    setBannerDisplayChildren,
    bannerContentActive,
    setBannerContentActive,
    bannerContentDisplayScope,
    setBannerContentDisplayScope,
    bannerContentDisplayChildren,
    setBannerContentDisplayChildren,
    bannerTitle,
    setBannerTitle,
    bannerDescription,
    setBannerDescription,
    bannerContentClassesByScope,
    setBannerContentClassesByScope,
    showcaseGroups,
    setShowcaseGroups,
    parent,
    setParent,
    description,
    setDescription,
    categoryChildren,
    setCategoryChildren,
    handleSubmitCategory,
    error,
    isSubmitted,
    handleSubmitEditCategory,
  };
};

export default useCategorySubmit;
