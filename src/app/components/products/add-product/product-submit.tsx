'use client';
import Tiptap from '@/components/tipTap/Tiptap';
import useProductSubmit from '@/hooks/useProductSubmit';
import { Controller } from 'react-hook-form';
import ProductCategory from '../../category/product-category';
import FormField from '../form-field';
import ShippingPrice from '../shipping-price';
// import AdditionalInformation from './additional-information';
import OfferDatePicker from './offer-date-picker';
import { ImageUploadWithMeta } from '@/components/image-upload-with-meta/image-upload-with-meta';
import ProductOptions from './product-options';
import ProductConfigurations from './product-configurations';
import ProductVariants from './product-variants';
import SEOFields from './seo-fields';
import Tags from './tags';
import Badges from './badges';
import YouTubeVideoInput from './youtube-video-input';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  FileText,
  Image as ImageIcon,
  Package,
  Save,
  Search,
  Settings,
  Truck,
} from 'lucide-react';

const ProductSubmit = () => {
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
    additionalInformation,
    imageURLs,
  } = useProductSubmit();

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit(handleSubmitProduct)}
        noValidate
        aria-labelledby="add-product-form"
      >
        <Tabs defaultValue="basic" className="w-full">
          <div className="overflow-x-auto pb-2 -mx-1 px-1">
            <TabsList className="inline-flex h-10 min-w-max justify-start rounded-lg bg-muted p-1 text-muted-foreground lg:w-full lg:justify-center">
              <TabsTrigger
                value="basic"
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <FileText className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <ImageIcon className="h-4 w-4" />
                Media & Organization
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <DollarSign className="h-4 w-4" />
                Pricing & Shipping
              </TabsTrigger>
              <TabsTrigger
                value="options"
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Package className="h-4 w-4" />
                Options & Variants
              </TabsTrigger>
              <TabsTrigger
                value="seo"
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Search className="h-4 w-4" />
                SEO
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="basic" className="mt-6 focus-visible:outline-none">
            <div
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              role="main"
              aria-label="Product creation form"
            >
              <div className="col-span-1 lg:col-span-8 xl:col-span-9 space-y-6">
            {/* General Information */}
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
                        className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0"
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
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-6 focus-visible:outline-none">
            <div className="space-y-4">
              {/* Row 1: Main Image + Category/Tags/Badges - side by side on md */}
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
                    <ImageUploadWithMeta
                      value={image}
                      onChange={setImage}
                      folder="ewo-assets/products"
                    />
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
                        />
                      </div>
                      <Separator />
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Product Tags</label>
                        <Tags tags={tags} setTags={setTags} className="mb-0" />
                      </div>
                      <Separator />
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Product Badges</label>
                        <Badges badges={badges} setBadges={setBadges} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 2: Variant Images - full width, compact */}
              <ProductVariants
                isSubmitted={isSubmitted}
                imageURLsWithMeta={imageURLsWithMeta}
                setImageURLsWithMeta={setImageURLsWithMeta}
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
                    register={register}
                    errors={errors}
                    step="0.01"
                  />
                  <FormField
                    title="SKU"
                    isRequired={true}
                    placeHolder="SKU"
                    bottomTitle="Enter the product SKU."
                    register={register}
                    errors={errors}
                  />
                  <FormField
                    title="quantity"
                    isRequired={true}
                    placeHolder="Quantity"
                    bottomTitle="Enter the product quantity."
                    type="number"
                    register={register}
                    errors={errors}
                  />
                  <FormField
                    title="discount"
                    type="number"
                    isRequired={false}
                    placeHolder="Discount"
                    bottomTitle="Set the product Discount."
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
                <ShippingPrice register={register} errors={errors} />
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
                      <CardTitle className="text-lg font-semibold">
                        Product Options
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Add customizable options like size, color, or material for
                        this product.
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProductOptions
                    setOptions={setOptions}
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
                      <CardTitle className="text-lg font-semibold">
                        Product Configurations
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Add product configurations with multiple options (e.g.,
                        Bore Misalignment, Thread Direction). Each option can have
                        its own price.
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProductConfigurations
                    setConfigurations={setProductConfigurations}
                    isSubmitted={isSubmitted}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="mt-6 focus-visible:outline-none">
            <div className="max-w-2xl">
              <SEOFields register={register} errors={errors} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Bar */}
        <Card className="shadow-card mt-8">
            <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-foreground">
                  Ready to create your product?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your product will be added to the catalog and become available
                  for purchase immediately.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 hover:bg-muted/50 transition-all duration-200"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button variant="default" type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  <span>Create Product</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ProductSubmit;
