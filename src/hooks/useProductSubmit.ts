'use client';
import {
  useAddProductMutation,
  useEditProductMutation,
} from '@/redux/product/productApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Tag } from 'react-tag-input';
import slugify from 'slugify';
import type { ImageWithMeta } from '@/types/image-with-meta';

type ICategory = {
  name: string;
  id: string;
};

type status = 'in-stock' | 'out-of-stock' | 'discontinued';

const useProductSubmit = () => {
  const [sku, setSku] = useState<string>('');
  const [image, setImage] = useState<ImageWithMeta | null>(null);
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [imageURLsWithMeta, setImageURLsWithMeta] = useState<ImageWithMeta[]>([]);
  const [parent, setParent] = useState<string>('');
  const [children, setChildren] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [finalPriceDiscount, setFinalPriceDiscount] = useState<number>(0);
  const [updatedPrice, setUpdatedPrice] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(0);
  const [category, setCategory] = useState<ICategory>({ name: '', id: '' });
  const [status, setStatus] = useState<status>('in-stock');
  const [description, setDescription] = useState<string>('');
  const [faqs, setFaqs] = useState<string>('');
  const [videoId, setVideoId] = useState<string>('');
  const [options, setOptions] = useState<{ title: string; price: number }[]>(
    []
  );
  const [productConfigurations, setProductConfigurations] = useState<
    {
      title: string;
      options: {
        name: string;
        price: number | string;
        isSelected: boolean;
        image?: string;
        imageWithMeta?: ImageWithMeta;
      }[];
    }[]
  >([]);
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
  const [badges, setBadges] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published'>('draft');
  const publishStatusRef = useRef<'draft' | 'published'>('draft');

  const router = useRouter();

  useEffect(() => {
    publishStatusRef.current = publishStatus;
  }, [publishStatus]);

  // Keep imageURLs in sync with imageURLsWithMeta for form progress and legacy consumers
  useEffect(() => {
    setImageURLs(imageURLsWithMeta.map((i) => i.url));
  }, [imageURLsWithMeta]);

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
    setImage(null);
    setTitle('');
    setSlug('');
    setUnit('');
    setImageURLs([]);
    setImageURLsWithMeta([]);
    setParent('');
    setChildren('');
    setPrice(0);
    setDiscount(0);
    setFinalPriceDiscount(0);
    setUpdatedPrice(undefined);
    setQuantity(0);
    setCategory({ name: '', id: '' });
    setStatus('in-stock');
    setDescription('');
    setFaqs('');
    setVideoId('');
    setOptions([]);
    setProductConfigurations([]);
    setOfferDate({
      startDate: null,
      endDate: null,
    });
    setAdditionalInformation([]);
    setTags([]);
    setBadges([]);
    setPublishStatus('draft');
    reset();
  };

  // handle submit product
  const handleSubmitProduct = async (data: any) => {
    // Debug: Log form data to check field values
    console.log('Form data received:', {
      finalPriceDiscount: data.finalPriceDiscount,
      updatedPrice: data.updatedPrice,
      price: data.price,
      discount: data.discount,
    });

    const imgUrl = image?.url ?? '';
    // product data
    const productData = {
      sku: data.SKU,
      img: imgUrl,
      image: image ?? undefined,
      title: data.title,
      slug: slugify(data.title, { replacement: '-', lower: true }),
      imageURLs: imageURLsWithMeta.length > 0 ? imageURLsWithMeta.map((i) => i.url) : imageURLs,
      imageURLsWithMeta: imageURLsWithMeta.length > 0 ? imageURLsWithMeta : undefined,
      parent: parent,
      children: children,
      price: data.price,
      discount: data.discount,
      finalPriceDiscount: data.finalPriceDiscount !== undefined && data.finalPriceDiscount !== null && data.finalPriceDiscount !== ''
        ? Number(data.finalPriceDiscount)
        : undefined,
      updatedPrice: data.updatedPrice !== undefined && data.updatedPrice !== null && data.updatedPrice !== ''
        ? Number(data.updatedPrice)
        : undefined,
      shipping: data.shipping?.price || data.shipping?.description
        ? {
            price: data.shipping?.price ? Number(data.shipping.price) : undefined,
            description: data.shipping?.description || undefined,
          }
        : undefined,
      quantity: data.quantity,
      category: category,
      status: status,
      options: options.filter(option => option.title.trim() !== ''),
      productConfigurations:
        productConfigurations.length > 0 ? productConfigurations : undefined,
      offerDate: {
        startDate: offerDate.startDate,
        endDate: offerDate.endDate,
      },
      description: data.description,
      faqs: data.faqs || '',
      moreDetails: data.moreDetails || '',
      videoId: data.videoId || '',
      additionalInformation: additionalInformation,
      tags: tags.map(tag => tag.text),
      badges: badges.length > 0 ? badges : undefined,
      seo: {
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        metaKeywords: data.metaKeywords || '',
      },
    };

    // Debug: Log product data being sent
    console.log('Product data being sent:', {
      finalPriceDiscount: productData.finalPriceDiscount,
      updatedPrice: productData.updatedPrice,
    });

    if (!imgUrl) {
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
    if (!data.finalPriceDiscount || Number(data.finalPriceDiscount) < 0) {
      return notifyError('Final Price Discount is required and must be 0 or greater');
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
      const imgUrl = image?.url ?? '';
      // product data
      const productData = {
        sku: data.SKU,
        img: imgUrl,
        image: image ?? undefined,
        title: data.title,
        slug: slugify(data.title, { replacement: '-', lower: true }),
        imageURLs: imageURLsWithMeta.length > 0 ? imageURLsWithMeta.map((i) => i.url) : imageURLs,
        imageURLsWithMeta: imageURLsWithMeta.length > 0 ? imageURLsWithMeta : undefined,
        parent: parent,
        children: children || '',
        price: data.price,
        discount: data.discount,
        finalPriceDiscount: data.finalPriceDiscount !== undefined && data.finalPriceDiscount !== null && String(data.finalPriceDiscount).trim() !== ''
          ? Number(data.finalPriceDiscount)
          : undefined,
        updatedPrice: data.updatedPrice !== undefined && data.updatedPrice !== null && String(data.updatedPrice).trim() !== ''
          ? Number(data.updatedPrice)
          : undefined,
        shipping: data.shipping?.price || data.shipping?.description
          ? {
              price: data.shipping?.price ? Number(data.shipping.price) : undefined,
              description: data.shipping?.description || undefined,
            }
          : undefined,
        quantity: data.quantity,
        category: category,
        status: status,
        options: options.filter(option => option.title.trim() !== ''),
        productConfigurations:
          productConfigurations.length > 0 ? productConfigurations : undefined,
        offerDate: {
          startDate: offerDate.startDate,
          endDate: offerDate.endDate,
        },
        description: data.description,
        faqs: data.faqs || '',
        moreDetails: data.moreDetails || '',
        videoId: data.videoId || '',
        additionalInformation: additionalInformation,
        tags: tags.map(tag => tag.text),
        badges: badges.length > 0 ? badges : undefined,
      seo: {
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        metaKeywords: data.metaKeywords || '',
      },
    };

    // Debug: Log product data being sent
    console.log('Product data being sent:', {
      finalPriceDiscount: productData.finalPriceDiscount,
      updatedPrice: productData.updatedPrice,
    });

    if (!imgUrl) {
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
      if (!data.finalPriceDiscount || Number(data.finalPriceDiscount) < 0) {
        return notifyError('Final Price Discount is required and must be 0 or greater');
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
    setValue,
    handleSubmitProduct,
    errors,
    publishStatus,
    setPublishStatus,
    publishStatusRef,
    tags,
    setTags,
    badges,
    setBadges,
    setAdditionalInformation,
    control,
    setCategory,
    setParent,
    setChildren,
    setImage,
    image,
    imageURLs,
    setImageURLs,
    imageURLsWithMeta,
    setImageURLsWithMeta,
    offerDate,
    setOfferDate,
    options,
    setOptions,
    productConfigurations,
    setProductConfigurations,
    isSubmitted,
    setIsSubmitted,
    handleEditProduct,
    additionalInformation,
    isLoading,
    editLoading,
    faqs,
    setFaqs,
    setStatus,
  };
};

export default useProductSubmit;
