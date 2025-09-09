'use client';
import Tiptap from '@/components/tipTap/Tiptap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import useProductSubmit from '@/hooks/useProductSubmit';
import { useGetProductQuery } from '@/redux/product/productApi';
import {
  ArrowLeft,
  DollarSign,
  Edit3,
  FileText,
  Image as ImageIcon,
  Loader2,
  Package,
  Save,
  Settings,
  Truck,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import ProductCategory from '../../category/product-category';
import ErrorMsg from '../../common/error-msg';
// import AdditionalInformation from '../add-product/additional-information';
import OfferDatePicker from '../add-product/offer-date-picker';
import ProductImgUpload from '../add-product/product-img-upload';
import ProductOptions from '../add-product/product-options';
import ProductVariants from '../add-product/product-variants';
import SEOFields from '../add-product/seo-fields';
import Tags from '../add-product/tags';
import FormField from '../form-field';
import ShippingPrice from '../shipping-price';

const EditProductSubmit = ({ id }: { id: string }) => {
  const { data: product, isError, isLoading } = useGetProductQuery(id);
  const [formProgress, setFormProgress] = useState(0);

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
    if (product.img && product.imageURLs?.length) completedSections++;
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
    editLoading,
  } = useProductSubmit();

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
    console.log('product--->', product);
    console.log('product.options', product.options);
    content = (
      <div className="space-y-6">
        {/* Header Section */}
        <Card className="shadow-card">
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm self-start sm:self-center">
                  <Edit3 className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2 flex-1">
                  <CardTitle
                    id="edit-product-form"
                    className="text-xl sm:text-2xl font-bold"
                  >
                    Edit Product
                  </CardTitle>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Update your product information, pricing, and settings
                  </p>
                  <Badge
                    variant="secondary"
                    className="gap-1.5 w-fit self-start"
                  >
                    <Package className="h-3 w-3" />
                    ID: {(product as any)._id?.slice(-8) || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
            {/* Progress Indicator
            <div className="mt-6 pt-6 border-t">
              <FormProgress progress={formProgress} />
            </div> */}
          </CardHeader>
        </Card>

        <form
          onSubmit={handleSubmit(data => handleEditProduct(data, id))}
          noValidate
          aria-labelledby="edit-product-form"
        >
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            role="main"
            aria-label="Product editing form"
          >
            {/* left side */}
            <div className="col-span-1 lg:col-span-8 xl:col-span-9 space-y-6">
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

                  {/* Description Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Description <span className="text-destructive">*</span>
                    </label>
                    <Controller
                      name="description"
                      control={control}
                      defaultValue={product.description}
                      rules={{ required: true }}
                      render={({ field }) => <Tiptap {...field} />}
                    />
                    <ErrorMsg
                      msg={(errors?.description?.message as string) || ''}
                    />
                  </div>
                </CardContent>
              </Card>

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

              {/* Media & Offers */}
              <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-pink-50 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Media & Special Offers
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Add videos and configure promotional periods
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FormField
                      title="youtube video Id"
                      isRequired={false}
                      placeHolder="video id"
                      bottomTitle="Set the video id of product."
                      defaultValue={product.videoId}
                      register={register}
                      errors={errors}
                    />
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
                  </div>
                </CardContent>
              </Card>

              {/* additional information page start */}
              {/* <AdditionalInformation
                setAdditionalInformation={setAdditionalInformation}
                default_value={product.additionalInformation}
              /> */}
              {/* additional information page end */}

              {/* Product Options */}
              <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Package className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Product Options
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Add customizable options like size, color, or material
                        for this product.
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

              {/* product variations start */}
              <ProductVariants
                isSubmitted={isSubmitted}
                setImageURLs={setImageURLs}
                default_value={product.imageURLs}
              />
              {/* product variations end */}

              {/* SEO fields start */}
              <SEOFields
                register={register}
                errors={errors}
                defaultValues={{
                  metaTitle: product.seo?.metaTitle || '',
                  metaDescription: product.seo?.metaDescription || '',
                  metaKeywords: product.seo?.metaKeywords || '',
                }}
              />
              {/* SEO fields end */}
            </div>

            {/* right side */}
            <div className="col-span-1 lg:col-span-4 xl:col-span-3 space-y-6">
              {/* Product Image */}
              <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-cyan-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Product Image
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Upload a high-quality product image. Supports drag &
                        drop.
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ProductImgUpload
                    imgUrl={img}
                    setImgUrl={setImg}
                    default_img={product.img}
                    isSubmitted={isSubmitted}
                  />
                </CardContent>
              </Card>

              {/* Product Category & Tags */}
              <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Settings className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Category & Tags
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Categorize and tag your product
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Product Category
                    </label>
                    <ProductCategory
                      setCategory={setCategory}
                      setParent={setParent}
                      setChildren={setChildren}
                      default_value={{
                        parent: product.category.name,
                        id: product.category.id,
                        children: product.children,
                      }}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Product Tags
                    </label>
                    <Tags
                      tags={tags}
                      setTags={setTags}
                      default_value={defaultTags}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">
                    Ready to publish changes?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Your changes will be saved and the product will be updated
                    immediately.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="gap-2 hover:bg-muted/50 transition-all duration-200"
                    disabled={editLoading}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Cancel Changes
                  </Button>
                  <Button
                    type="submit"
                    disabled={editLoading}
                    className="gap-2 bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success/80 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
                  >
                    {editLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating Product...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Update Product</span>
                      </>
                    )}
                  </Button>
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
