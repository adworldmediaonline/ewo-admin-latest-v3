'use client';
import {
  useAddProductMutation,
  useEditProductMutation,
} from '@/redux/product/productApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Tag } from 'react-tag-input';
import slugify from 'slugify';

type ICategory = {
  name: string;
  id: string;
};

type status = 'in-stock' | 'out-of-stock' | 'discontinued';

const useProductSubmit = () => {
  const [sku, setSku] = useState<string>('');
  const [img, setImg] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [parent, setParent] = useState<string>('');
  const [children, setChildren] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [category, setCategory] = useState<ICategory>({ name: '', id: '' });
  const [status, setStatus] = useState<status>('in-stock');
  const [description, setDescription] = useState<string>('');
  const [videoId, setVideoId] = useState<string>('');
  const [options, setOptions] = useState<{ title: string; price: number }[]>(
    []
  );
  const [offerDate, setOfferDate] = useState<{
    startDate: null;
    endDate: null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [additionalInformation, setAdditionalInformation] = useState<
    {
      key: string;
      value: string;
    }[]
  >([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const router = useRouter();

  // useAddProductMutation
  const [addProduct, { data: addProductData, isError, isLoading }] =
    useAddProductMutation();
  // useAddProductMutation
  const [
    editProduct,
    { data: editProductData, isError: editErr, isLoading: editLoading },
  ] = useEditProductMutation();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm();

  // resetForm
  const resetForm = () => {
    setSku('');
    setImg('');
    setTitle('');
    setSlug('');
    setUnit('');
    setImageURLs([]);
    setParent('');
    setChildren('');
    setPrice(0);
    setDiscount(0);
    setQuantity(0);
    setCategory({ name: '', id: '' });
    setStatus('in-stock');
    setDescription('');
    setVideoId('');
    setOptions([]);
    setOfferDate({
      startDate: null,
      endDate: null,
    });
    setAdditionalInformation([]);
    setTags([]);
    reset();
  };

  // handle submit product
  const handleSubmitProduct = async (data: any) => {
    // product data
    const productData = {
      sku: data.SKU,
      img: img,
      title: data.title,
      slug: slugify(data.title, { replacement: '-', lower: true }),
      imageURLs,
      parent: parent,
      children: children,
      price: data.price,
      discount: data.discount,
      shipping: {
        price: data.shipping?.price || 0,
        description: data.shipping?.description || '',
      },
      quantity: data.quantity,
      category: category,
      status: status,
      options: options.filter(option => option.title.trim() !== ''),
      offerDate: {
        startDate: offerDate.startDate,
        endDate: offerDate.endDate,
      },
      description: data.description,
      videoId: data.youtube_video_Id,
      additionalInformation: additionalInformation,
      tags: tags.map(tag => tag.text),
      seo: {
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        metaKeywords: data.metaKeywords || '',
      },
    };

    if (!img) {
      return notifyError('Product image is required');
    }
    if (!category.name || !category.id) {
      return notifyError('Category name and id are required');
    }
    if (!parent) {
      return notifyError('Parent category is required');
    }
    if (Number(data.discount) > Number(data.price)) {
      return notifyError('Product price must be greater than discount');
    }
    // Validate options if any are provided
    if (
      options.length > 0 &&
      options.some(option => option.title.trim() !== '')
    ) {
      const invalidOptions = options.filter(
        option =>
          option.title.trim() !== '' &&
          (option.price < 0 || isNaN(option.price))
      );
      if (invalidOptions.length > 0) {
        return notifyError(
          'All option prices must be valid numbers greater than or equal to 0'
        );
      }
    }

    const res = await addProduct(productData as any);
    if ('error' in res && res.error) {
      if ('data' in res.error) {
        const errorData = res.error.data as { message?: string };
        if (typeof errorData.message === 'string') {
          return notifyError(errorData.message);
        }
      }
    } else {
      notifySuccess('Product created successfully');
      setIsSubmitted(true);
      resetForm();
      router.push('/dashboard/super-admin/product');
    }
  };

  // handle edit product
  const handleEditProduct = async (data: any, id: string) => {
    try {
      // product data
      const productData = {
        sku: data.SKU,
        img: img,
        title: data.title,
        slug: slugify(data.title, { replacement: '-', lower: true }),
        imageURLs,
        parent: parent,
        children: children || '',
        price: data.price,
        discount: data.discount,
        shipping: {
          price: data.shipping?.price || 0,
          description: data.shipping?.description || '',
        },
        quantity: data.quantity,
        category: category,
        status: status,
        options: options.filter(option => option.title.trim() !== ''),
        offerDate: {
          startDate: offerDate.startDate,
          endDate: offerDate.endDate,
        },
        description: data.description,
        videoId: data.youtube_video_Id,
        additionalInformation: additionalInformation,
        tags: tags.map(tag => tag.text),
        seo: {
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          metaKeywords: data.metaKeywords || '',
        },
      };

      if (!img) {
        return notifyError('Product image is required');
      }
      if (!category.name || !category.id) {
        return notifyError('Category name and id are required');
      }
      if (!parent) {
        return notifyError('Parent category is required');
      }
      if (Number(data.discount) > Number(data.price)) {
        return notifyError('Product price must be greater than discount');
      }
      // Validate options if any are provided
      if (
        options.length > 0 &&
        options.some(option => option.title.trim() !== '')
      ) {
        const invalidOptions = options.filter(
          option =>
            option.title.trim() !== '' &&
            (option.price < 0 || isNaN(option.price))
        );
        if (invalidOptions.length > 0) {
          return notifyError(
            'All option prices must be valid numbers greater than or equal to 0'
          );
        }
      }

      const res = await editProduct({ id: id, data: productData as any });
      if ('error' in res && res.error) {
        if ('data' in res.error) {
          const errorData = res.error.data as { message?: string };
          if (typeof errorData.message === 'string') {
            return notifyError(errorData.message);
          }
        }
      } else {
        notifySuccess('Product updated successfully');
        setIsSubmitted(true);
        router.push('/dashboard/super-admin/product');
        resetForm();
      }
    } catch (error) {
      notifyError('Something went wrong updating the product');
    }
  };

  return {
    register,
    handleSubmit,
    handleSubmitProduct,
    errors,
    tags,
    setTags,
    setAdditionalInformation,
    control,
    setCategory,
    setParent,
    setChildren,
    setImg,
    img,
    imageURLs,
    setImageURLs,
    offerDate,
    setOfferDate,
    options,
    setOptions,
    isSubmitted,
    setIsSubmitted,
    handleEditProduct,
    additionalInformation,
    isLoading,
    editLoading,
  };
};

export default useProductSubmit;
