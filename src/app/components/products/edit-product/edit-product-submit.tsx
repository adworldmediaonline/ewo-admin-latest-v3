'use client';
import Tiptap from '@/components/tipTap/Tiptap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useProductSubmit from '@/hooks/useProductSubmit';
import { useGetProductQuery, useDeleteProductMutation } from '@/redux/product/productApi';
import {
  ArrowLeft,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Loader2,
  Package,
  Save,
  Search,
  Settings,
  Trash2,
  Truck,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import ProductCategory from '../../category/product-category';
// import AdditionalInformation from '../add-product/additional-information';
import { useRouter } from 'next/navigation';
import OfferDatePicker from '../add-product/offer-date-picker';
import { ImageUploadWithMeta } from '@/components/image-upload-with-meta/image-upload-with-meta';
import ProductOptions from '../add-product/product-options';
import ProductConfigurations from '../add-product/product-configurations';
import ProductVariants from '../add-product/product-variants';
import type { ImageWithMeta } from '@/types/image-with-meta';
import SEOFields from '../add-product/seo-fields';
import Tags from '../add-product/tags';
import Badges from '../add-product/badges';
import YouTubeVideoInput from '../add-product/youtube-video-input';
import FormField from '../form-field';
import ShippingPrice from '../shipping-price';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { notifyError, notifySuccess } from '@/utils/toast';

const EditProductSubmit = ({ id }: { id: string }) => {
  const { data: product, isError, isLoading } = useGetProductQuery(id);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [formProgress, setFormProgress] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Memoize the default tags value to prevent infinite re-renders
  const defaultTags = useMemo(() => {
    return (
      product?.tags?.map((tag: string, index: number) => ({
        id: tag,
        text: tag,
        className: '',
      })) || []
    );
  }, [product?.tags]);

  // Calculate form progress
  useEffect(() => {
    if (!product) return;

    let completedSections = 0;
    const totalSections = 6;

    // Basic info section
    if (product.title && product.description) completedSections++;
    // Pricing section
    if (product.price && product.sku && product.quantity) completedSections++;
    // Shipping section
    if (product.shipping) completedSections++;
    // Media section
    if ((product.image?.url || product.img) && product.imageURLs?.length) completedSections++;
    // Category section
    if (product.category && product.tags?.length) completedSections++;
    // SEO section
    if (product.seo) completedSections++;

    setFormProgress(Math.round((completedSections / totalSections) * 100));
  }, [product]);

  const {
    handleSubmit,
    handleSubmitProduct,
    register,
    setValue,
    errors,
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
    editLoading,
    publishStatusRef,
    setPublishStatus,
  } = useProductSubmit();

  const handleSubmitWithStatus = (status: 'draft' | 'published') => {
    publishStatusRef.current = status;
    formRef.current?.requestSubmit();
  };

  const handleDeleteProduct = async () => {
    try {
      const res = await deleteProduct(id);
      if ('error' in res && res.error) {
        const err = res.error as { data?: { message?: string } };
        notifyError(err.data?.message || 'Failed to delete product');
      } else {
        setDeleteDialogOpen(false);
        notifySuccess('Product deleted successfully');
        router.push('/dashboard/super-admin/product');
      }
    } catch {
      notifyError('Failed to delete product');
    }
  };

  // Load publishStatus when product data is available
  useEffect(() => {
    if (product?.publishStatus) {
      setPublishStatus(product.publishStatus as 'draft' | 'published');
    } else if (product) {
      setPublishStatus('published'); // backwards compat for products without the field
    }
  }, [product?._id, product?.publishStatus, setPublishStatus]);

  // Load main product image when product data is available
  useEffect(() => {
    if (!product) return;
    if (product.image?.url) {
      setImage({
        url: product.image.url,
        fileName: product.image.fileName ?? '',
        title: product.image.title ?? '',
        altText: product.image.altText ?? '',
      });
    } else if (product.img) {
      setImage({
        url: product.img,
        fileName: '',
        title: '',
        altText: '',
      });
    } else {
      setImage(null);
    }
  }, [product?._id, product?.img, product?.image?.url, setImage]);

  // decide what to render
  let content = null;

  if (isLoading) {
    content = (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Loading Product
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we fetch the product details...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!isLoading && isError) {
    content = (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md border-destructive/50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-medium text-destructive mb-2">
              Error Loading Product
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              We couldn't load the product details. Please try again.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <Loader2 className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!isLoading && !isError && product) {
    content = (
      <div className="space-y-6">
        <form
          ref={formRef}
          onSubmit={handleSubmit(data => handleEditProduct(data, id))}
          noValidate
          aria-labelledby="edit-product-form"
        >
          <Tabs defaultValue="basic" className="w-full">
            <div className="overflow-x-auto pb-2 -mx-1 px-1">
              <TabsList className="inline-flex h-10 min-w-max justify-start rounded-lg bg-muted p-1 text-muted-foreground lg:w-full lg:justify-center">
                <TabsTrigger value="basic" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <FileText className="h-4 w-4" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="media" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <ImageIcon className="h-4 w-4" />
                  Media & Organization
                </TabsTrigger>
                <TabsTrigger value="pricing" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <DollarSign className="h-4 w-4" />
                  Pricing & Shipping
                </TabsTrigger>
                <TabsTrigger value="options" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Package className="h-4 w-4" />
                  Options & Variants
                </TabsTrigger>
                <TabsTrigger value="seo" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Search className="h-4 w-4" />
                  SEO
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="basic" className="mt-6 focus-visible:outline-none">
              <div className="space-y-6" role="main" aria-label="Product editing form">
              <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        General Information
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Basic product details and description
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    title="title"
                    isRequired={true}
                    placeHolder="Product Title"
                    register={register}
                    errors={errors}
                    defaultValue={product.title}
                  />

                  {/* Enhanced Description Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Description <span className="text-destructive">*</span>
                      </label>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Rich text editor
                        </span>
                        <span>•</span>
                        <span>Supports formatting</span>
                      </div>
                    </div>

                    <div className="relative">
                      <Controller
                        name="description"
                        control={control}
                        defaultValue={product.description}
                        rules={{
                          required: 'Product description is required',
                          validate: value => {
                            if (!value || value.trim() === '') {
                              return 'Product description cannot be empty';
                            }
                            if (value.length < 10) {
                              return 'Description must be at least 10 characters long';
                            }
                            return true;
                          },
                        }}
                        render={({ field }) => (
                          <Tiptap
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Describe your product in detail. Include key features, benefits, specifications, and any important information for customers..."
                            limit={50000}
                            showCharacterCount={true}
                          />
                        )}
                      />
                    </div>

                    {/* Enhanced Error Display */}
                    {errors?.description && (
                      <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <svg
                          className="w-4 h-4 text-destructive mt-0.5 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="text-sm">
                          <p className="font-medium text-destructive">
                            Description Error
                          </p>
                          <p className="text-destructive/80 mt-0.5">
                            {errors?.description?.message as string}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Description Preview Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        Your description will be displayed to customers on the
                        product page
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Preview
                        </span>
                        <button
                          type="button"
                          className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded transition-colors"
                          onClick={() => {
                            // Could implement a preview modal here
                            console.log('Preview clicked');
                          }}
                        >
                          👁️ View
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQs Section */}
              <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Frequently Asked Questions (FAQs)
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Add FAQs for your product (Optional)
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        FAQs Content
                      </label>
                      <span className="text-xs text-muted-foreground">
                        Optional
                      </span>
                    </div>
                    <div className="relative">
                      <Controller
                        name="faqs"
                        control={control}
                        defaultValue={product.faqs || ''}
                        render={({ field }) => (
                          <Tiptap
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Add frequently asked questions and answers for your product..."
                            limit={50000}
                            showCharacterCount={true}
                          />
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-6 focus-visible:outline-none">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card className="md:col-span-2 shadow-card">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-cyan-50 flex items-center justify-center shrink-0">
                          <ImageIcon className="h-3.5 w-3.5 text-cyan-600" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base font-semibold">Main Product Image</CardTitle>
                          <p className="text-xs text-muted-foreground">Filename, title, alt text for SEO</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0">
                      <ImageUploadWithMeta value={image} onChange={setImage} folder="ewo-assets/products" />
                    </CardContent>
                  </Card>
                  <Card className="md:col-span-3 shadow-card">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
                          <Settings className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base font-semibold">Category, Tags & Badges</CardTitle>
                          <p className="text-xs text-muted-foreground">Organize and label your product</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 space-y-4">
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">Product Category</label>
                          <ProductCategory
                            setCategory={setCategory}
                            setParent={setParent}
                            setChildren={setChildren}
                            default_value={{
                              parent: product.category?.name ?? '',
                              id: product.category?.id ?? '',
                              children: product.children ?? [],
                            }}
                          />
                        </div>
                        <Separator />
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">Product Tags</label>
                          <Tags tags={tags} setTags={setTags} default_value={defaultTags} className="mb-0" />
                        </div>
                        <Separator />
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">Product Badges</label>
                          <Badges badges={badges} setBadges={setBadges} default_value={product.badges} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <ProductVariants
                  isSubmitted={isSubmitted}
                  imageURLsWithMeta={imageURLsWithMeta}
                  setImageURLsWithMeta={setImageURLsWithMeta}
                  default_value={
                    product.imageURLsWithMeta?.length
                      ? (product.imageURLsWithMeta as ImageWithMeta[])
                      : product.imageURLs
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="mt-6 focus-visible:outline-none">
              <div className="space-y-6">
              {/* Pricing & Inventory */}
              <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Pricing & Inventory
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Set prices, stock levels, and product codes
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <FormField
                      title="price"
                      isRequired={true}
                      placeHolder="Product price"
                      bottomTitle="Set the base price of product."
                      type="number"
                      defaultValue={product.price}
                      register={register}
                      errors={errors}
                      step="0.01"
                    />
                    <FormField
                      title="SKU"
                      isRequired={true}
                      placeHolder="SKU"
                      bottomTitle="Enter the product SKU."
                      defaultValue={product.sku}
                      register={register}
                      errors={errors}
                    />
                    <FormField
                      title="quantity"
                      isRequired={true}
                      placeHolder="Quantity"
                      bottomTitle="Enter the product quantity."
                      type="number"
                      defaultValue={product.quantity}
                      register={register}
                      errors={errors}
                    />
                    <FormField
                      title="discount"
                      type="number"
                      isRequired={false}
                      placeHolder="Discount"
                      bottomTitle="Set the product Discount."
                      defaultValue={product.discount}
                      register={register}
                      errors={errors}
                      step="0.01"
                    />
                    <FormField
                      title="finalPriceDiscount"
                      type="number"
                      isRequired={true}
                      placeHolder="Final Price Discount"
                      bottomTitle="Set the final price after discount (required)."
                      defaultValue={product.finalPriceDiscount}
                      register={register}
                      errors={errors}
                      step="0.01"
                    />
                    <FormField
                      title="updatedPrice"
                      type="number"
                      isRequired={false}
                      placeHolder="Updated Price (Optional)"
                      bottomTitle="Set an updated price if needed (optional)."
                      defaultValue={product.updatedPrice}
                      register={register}
                      errors={errors}
                      step="0.01"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Truck className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Shipping Information
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Configure shipping costs and delivery details for this
                        product.
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ShippingPrice
                    register={register}
                    errors={errors}
                    defaultPrice={product.shipping ? product.shipping.price : 0}
                    defaultDescription={
                      product.shipping ? product.shipping.description : ''
                    }
                  />
                </CardContent>
              </Card>

              {/* YouTube Video */}
              <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Product Video
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Add a YouTube video to showcase your product
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <YouTubeVideoInput
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    defaultValue={product.videoId}
                  />
                </CardContent>
              </Card>

              {/* Special Offers */}
              <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-pink-50 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Special Offers
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Configure promotional periods for this product
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* date picker start */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Offer Period
                    </label>
                    <OfferDatePicker
                      offerDate={offerDate}
                      setOfferDate={setOfferDate}
                      defaultValue={product.offerDate}
                    />
                    <p className="text-xs text-muted-foreground">
                      Set the product offer start and end date
                    </p>
                  </div>
                  {/* date picker end */}
                </CardContent>
              </Card>

              </div>
            </TabsContent>

            <TabsContent value="options" className="mt-6 focus-visible:outline-none">
              <div className="space-y-6">
                <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Package className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">Product Options</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Add customizable options like size, color, or material for this product.
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ProductOptions
                      setOptions={setOptions}
                      default_value={product.options}
                      isSubmitted={isSubmitted}
                    />
                  </CardContent>
                </Card>
                <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Settings className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">Product Configurations</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Add product configurations with multiple options (e.g., Bore Misalignment, Thread Direction).
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ProductConfigurations
                      setConfigurations={setProductConfigurations}
                      default_value={product.productConfigurations}
                      isSubmitted={isSubmitted}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="mt-6 focus-visible:outline-none">
              <div className="w-full">
                <SEOFields
                  register={register}
                  errors={errors}
                  defaultValues={{
                    metaTitle: product.seo?.metaTitle || '',
                    metaDescription: product.seo?.metaDescription || '',
                    metaKeywords: product.seo?.metaKeywords || '',
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <Card className="mt-8 shadow-card">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">
                    Ready to save changes?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Save as draft to continue later, or publish to make it visible on the store.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="gap-2 hover:bg-muted/50 transition-all duration-200"
                    disabled={editLoading}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Cancel Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSubmitWithStatus('draft')}
                    disabled={editLoading}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save as Draft</span>
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => handleSubmitWithStatus('published')}
                    disabled={editLoading}
                    className="gap-2"
                  >
                    {editLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Publish Changes</span>
                      </>
                    )}
                  </Button>
                  <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={editLoading || isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span>Delete Product</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete product?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the product
                          and remove it from the catalog.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteProduct}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Deleting...
                            </>
                          ) : (
                            'Delete'
                          )}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Progress Summary */}
              {/* <div className="mt-6 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Form completion: {formProgress}%</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span>All required fields completed</span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-muted rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-success to-success/80 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${formProgress}%` }}
                  ></div>
                </div>
              </div> */}
            </CardContent>
          </Card>
        </form>
      </div>
    );
  }

  return <>{content}</>;
};

export default EditProductSubmit;
