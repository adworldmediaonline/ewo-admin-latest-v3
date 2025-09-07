'use client';
import { useGetAllBrandsQuery } from '@/redux/brand/brandApi';
import { useGetAllCategoriesQuery } from '@/redux/category/categoryApi';
import { useGetAllProductsQuery } from '@/redux/product/productApi';
import { IAddCoupon, ICoupon } from '@/types/coupon';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactSelect, { MultiValue } from 'react-select';
import GlobalImgUpload from '../category/global-img-upload';

interface SelectOption {
  value: string;
  label: string;
}

interface IProps {
  onSubmit: (data: IAddCoupon) => void;
  isSubmitted: boolean;
  setIsSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  logo: string;
  setLogo: React.Dispatch<React.SetStateAction<string>>;
  defaultValues?: Partial<ICoupon>;
  isEdit?: boolean;
}

export default function EnhancedCouponForm({
  onSubmit,
  isSubmitted,
  setIsSubmitted,
  logo,
  setLogo,
  defaultValues,
  isEdit = false,
}: IProps) {
  const [discountType, setDiscountType] = useState<string>(
    defaultValues?.discountType || 'percentage'
  );
  const [applicableType, setApplicableType] = useState<string>(
    defaultValues?.applicableType || 'all'
  );
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    defaultValues?.applicableProducts || []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    defaultValues?.applicableCategories || []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    defaultValues?.applicableBrands || []
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<IAddCoupon>({
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      couponCode: defaultValues?.couponCode || '',
      discountType: defaultValues?.discountType || 'percentage',
      discountPercentage: defaultValues?.discountPercentage || 0,
      discountAmount: defaultValues?.discountAmount || 0,
      buyQuantity: defaultValues?.buyQuantity || 1,
      getQuantity: defaultValues?.getQuantity || 1,
      minimumAmount: defaultValues?.minimumAmount || 0,
      maximumAmount: defaultValues?.maximumAmount || undefined,
      usageLimit: defaultValues?.usageLimit || undefined,
      usageLimitPerUser: defaultValues?.usageLimitPerUser || undefined,
      applicableType: defaultValues?.applicableType || 'all',
      productType: defaultValues?.productType || '',
      applicableProducts: defaultValues?.applicableProducts || [],
      applicableCategories: defaultValues?.applicableCategories || [],
      applicableBrands: defaultValues?.applicableBrands || [],
      stackable: defaultValues?.stackable || false,
      priority: defaultValues?.priority || 0,
      status: defaultValues?.status || 'active',
      isPublic: defaultValues?.isPublic !== false,
      userRestrictions: {
        newUsersOnly: defaultValues?.userRestrictions?.newUsersOnly || false,
      },
      startTime: defaultValues?.startTime
        ? new Date(defaultValues.startTime).toISOString().slice(0, 16)
        : '',
      endTime: defaultValues?.endTime
        ? new Date(defaultValues.endTime).toISOString().slice(0, 16)
        : '',
    },
  });

  // Fetch data for dropdowns
  const { data: products } = useGetAllProductsQuery();
  const { data: categories } = useGetAllCategoriesQuery();
  const { data: brands } = useGetAllBrandsQuery();

  // Watch for discount type changes
  const watchedDiscountType = watch('discountType');
  const watchedApplicableType = watch('applicableType');

  useEffect(() => {
    setDiscountType(watchedDiscountType || 'percentage');
  }, [watchedDiscountType]);

  useEffect(() => {
    setApplicableType(watchedApplicableType || 'all');
  }, [watchedApplicableType]);

  // Clear selections when applicable type changes
  useEffect(() => {
    if (watchedApplicableType === 'all') {
      // Clear all selections when switching to "all"
      setSelectedProducts([]);
      setSelectedCategories([]);
      setSelectedBrands([]);
    } else if (watchedApplicableType === 'product') {
      // Clear categories and brands when switching to products
      setSelectedCategories([]);
      setSelectedBrands([]);
    } else if (watchedApplicableType === 'category') {
      // Clear products and brands when switching to categories
      setSelectedProducts([]);
      setSelectedBrands([]);
    } else if (watchedApplicableType === 'brand') {
      // Clear products and categories when switching to brands
      setSelectedProducts([]);
      setSelectedCategories([]);
    }
  }, [watchedApplicableType]);

  // Prepare options for ReactSelect
  const productOptions: SelectOption[] =
    products?.data?.map(product => ({
      value: product._id,
      label: `${product.title} (${product.sku})`,
    })) || [];

  const categoryOptions: SelectOption[] =
    categories?.result?.map(category => ({
      value: category.parent,
      label: category.parent,
    })) || [];

  const brandOptions: SelectOption[] =
    brands?.result?.map((brand: { _id: string; name: string }) => ({
      value: brand.name,
      label: brand.name,
    })) || [];

  const handleFormSubmit = (data: IAddCoupon) => {
    const formData: IAddCoupon = {
      ...data,
      logo,
      applicableProducts: applicableType === 'product' ? selectedProducts : [],
      applicableCategories:
        applicableType === 'category' ? selectedCategories : [],
      applicableBrands: applicableType === 'brand' ? selectedBrands : [],
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

        {/* Logo Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coupon Logo (Optional)
          </label>
          <GlobalImgUpload
            isSubmitted={isSubmitted}
            setImage={setLogo}
            image={logo}
            setIsSubmitted={setIsSubmitted}
            default_img={defaultValues?.logo}
          />
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coupon Title *
          </label>
          <input
            {...register('title', { required: 'Title is required' })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter coupon title"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter coupon description"
          />
        </div>

        {/* Coupon Code */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coupon Code *
          </label>
          <input
            {...register('couponCode', { required: 'Coupon code is required' })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter coupon code"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.couponCode && (
            <p className="text-red-500 text-sm mt-1">
              {errors.couponCode.message}
            </p>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              {...register('startTime')}
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time *
            </label>
            <input
              {...register('endTime', { required: 'End time is required' })}
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.endTime.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Discount Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Discount Configuration</h3>

        {/* Discount Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Type *
          </label>
          <select
            {...register('discountType', {
              required: 'Discount type is required',
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="percentage">Percentage Discount</option>
            <option value="fixed_amount">Fixed Amount Discount</option>
            <option value="buy_x_get_y">Buy X Get Y</option>
            <option value="free_shipping">Free Shipping</option>
          </select>
        </div>

        {/* Conditional Discount Fields */}
        {discountType === 'percentage' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Percentage *
            </label>
            <input
              {...register('discountPercentage', {
                required: 'Discount percentage is required',
                min: { value: 0, message: 'Must be at least 0' },
                max: { value: 100, message: 'Cannot exceed 100' },
              })}
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter percentage (0-100)"
            />
            {errors.discountPercentage && (
              <p className="text-red-500 text-sm mt-1">
                {errors.discountPercentage.message}
              </p>
            )}
          </div>
        )}

        {discountType === 'fixed_amount' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Amount *
            </label>
            <input
              {...register('discountAmount', {
                required: 'Discount amount is required',
                min: { value: 0, message: 'Must be at least 0' },
              })}
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter discount amount"
            />
            {errors.discountAmount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.discountAmount.message}
              </p>
            )}
          </div>
        )}

        {discountType === 'buy_x_get_y' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buy Quantity *
              </label>
              <input
                {...register('buyQuantity', {
                  required: 'Buy quantity is required',
                  min: { value: 1, message: 'Must be at least 1' },
                })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buy quantity"
              />
              {errors.buyQuantity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.buyQuantity.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Get Quantity *
              </label>
              <input
                {...register('getQuantity', {
                  required: 'Get quantity is required',
                  min: { value: 1, message: 'Must be at least 1' },
                })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Get quantity"
              />
              {errors.getQuantity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.getQuantity.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Usage Restrictions */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Usage Restrictions</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Order Amount *
            </label>
            <input
              {...register('minimumAmount', {
                required: 'Minimum amount is required',
                min: { value: 0, message: 'Must be at least 0' },
              })}
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum order amount"
            />
            {errors.minimumAmount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.minimumAmount.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Order Amount
            </label>
            <input
              {...register('maximumAmount', {
                min: { value: 0, message: 'Must be at least 0' },
              })}
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Maximum order amount (optional)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Usage Limit
            </label>
            <input
              {...register('usageLimit', {
                min: { value: 1, message: 'Must be at least 1' },
              })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Total usage limit (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usage Limit Per User
            </label>
            <input
              {...register('usageLimitPerUser', {
                min: { value: 1, message: 'Must be at least 1' },
              })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Usage limit per user (optional)"
            />
          </div>
        </div>
      </div>

      {/* Product Restrictions */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Product Restrictions</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applicable To
          </label>
          <select
            {...register('applicableType')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Products</option>
            <option value="category">Specific Categories</option>
            <option value="product">Specific Products</option>
            <option value="brand">Specific Brands</option>
          </select>
          {applicableType === 'all' && (
            <p className="text-sm text-green-600 mt-1">
              ✓ This coupon will apply to all products in your store
            </p>
          )}
        </div>

        {/* Product Selection */}
        {applicableType === 'product' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Products *
            </label>
            <ReactSelect
              isMulti
              value={productOptions.filter((option: SelectOption) =>
                selectedProducts.includes(option.value)
              )}
              onChange={(selectedOptions: MultiValue<SelectOption>) => {
                const values = selectedOptions
                  ? selectedOptions.map((opt: SelectOption) => opt.value)
                  : [];
                setSelectedProducts(values);
              }}
              options={productOptions}
              placeholder="Search and select products..."
              className="react-select-container"
              classNamePrefix="react-select"
              isSearchable
              isClearable
              maxMenuHeight={200}
            />
            <p className="text-sm text-gray-500 mt-1">
              {selectedProducts.length} product(s) selected
            </p>
            {selectedProducts.length === 0 && applicableType === 'product' && (
              <p className="text-red-500 text-sm mt-1">
                Please select at least one product
              </p>
            )}
          </div>
        )}

        {/* Category Selection */}
        {applicableType === 'category' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Categories *
            </label>
            <ReactSelect
              isMulti
              value={categoryOptions.filter((option: SelectOption) =>
                selectedCategories.includes(option.value)
              )}
              onChange={(selectedOptions: MultiValue<SelectOption>) => {
                const values = selectedOptions
                  ? selectedOptions.map((opt: SelectOption) => opt.value)
                  : [];
                setSelectedCategories(values);
              }}
              options={categoryOptions}
              placeholder="Search and select categories..."
              className="react-select-container"
              classNamePrefix="react-select"
              isSearchable
              isClearable
              maxMenuHeight={200}
            />
            <p className="text-sm text-gray-500 mt-1">
              {selectedCategories.length} categor(ies) selected
            </p>
            {selectedCategories.length === 0 &&
              applicableType === 'category' && (
                <p className="text-red-500 text-sm mt-1">
                  Please select at least one category
                </p>
              )}
          </div>
        )}

        {/* Brand Selection */}
        {applicableType === 'brand' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Brands *
            </label>
            <ReactSelect
              isMulti
              value={brandOptions.filter((option: SelectOption) =>
                selectedBrands.includes(option.value)
              )}
              onChange={(selectedOptions: MultiValue<SelectOption>) => {
                const values = selectedOptions
                  ? selectedOptions.map((opt: SelectOption) => opt.value)
                  : [];
                setSelectedBrands(values);
              }}
              options={brandOptions}
              placeholder="Search and select brands..."
              className="react-select-container"
              classNamePrefix="react-select"
              isSearchable
              isClearable
              maxMenuHeight={200}
            />
            <p className="text-sm text-gray-500 mt-1">
              {selectedBrands.length} brand(s) selected
            </p>
            {selectedBrands.length === 0 && applicableType === 'brand' && (
              <p className="text-red-500 text-sm mt-1">
                Please select at least one brand
              </p>
            )}
          </div>
        )}

        {/* Legacy Category Field for Backward Compatibility */}
        {applicableType === 'category' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Category (Legacy)
            </label>
            <input
              {...register('productType')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product category (for backward compatibility)"
            />
            <p className="text-sm text-gray-500 mt-1">
              This field is kept for backward compatibility. Use the
              multi-select above for better control.
            </p>
          </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <input
              {...register('priority')}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Priority (higher = more priority)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center">
            <input
              {...register('stackable')}
              type="checkbox"
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              Allow stacking with other coupons
            </span>
          </label>

          <label className="flex items-center">
            <input
              {...register('isPublic')}
              type="checkbox"
              defaultChecked
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              Make coupon publicly visible
            </span>
          </label>

          <label className="flex items-center">
            <input
              {...register('userRestrictions.newUsersOnly')}
              type="checkbox"
              className="mr-2"
            />
            <span className="text-sm text-gray-700">New users only</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isEdit ? 'Update Coupon' : 'Create Coupon'}
        </button>
      </div>
    </form>
  );
}
