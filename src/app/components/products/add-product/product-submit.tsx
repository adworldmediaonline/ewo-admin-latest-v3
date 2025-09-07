'use client';
import React from 'react';
import useProductSubmit from '@/hooks/useProductSubmit';
// import DescriptionTextarea from './description-textarea';
import OfferDatePicker from './offer-date-picker';
import AdditionalInformation from './additional-information';
import ProductVariants from './product-variants';
import ProductImgUpload from './product-img-upload';
import ProductCategory from '../../category/product-category';
import Tags from './tags';
import FormField from '../form-field';
import { Controller } from 'react-hook-form';
import ErrorMsg from '../../common/error-msg';
import ProductOptions from './product-options';
import ShippingPrice from '../shipping-price';
import SEOFields from './seo-fields';

import Tiptap from '@/components/tipTap/Tiptap';

const ProductSubmit = () => {
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
    setImageURLs,
    offerDate,
    setOfferDate,
    options,
    setOptions,
    isSubmitted,
    additionalInformation,
    imageURLs,
  } = useProductSubmit();

  console.log(
    'additionalInformation--->',
    additionalInformation,
    'imageURLs--->',
    imageURLs
  );

  return (
    <form onSubmit={handleSubmit(handleSubmitProduct)}>
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* left side */}
        <div className="col-span-12 xl:col-span-8 2xl:col-span-9">
          <div className="px-8 py-8 mb-6 bg-white rounded-md">
            <h4 className="text-[22px]">General</h4>
            <FormField
              title="title"
              isRequired={true}
              placeHolder="Product Title"
              register={register}
              errors={errors}
            />
            {/* tip tap editor start */}
            <div className="mb-5">
              <p className="mb-0 text-base text-black capitalize">
                Description <span className="text-red">*</span>
              </p>
              <Controller
                name="description"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <Tiptap {...field} />}
              />
              <ErrorMsg msg={(errors?.description?.message as string) || ''} />
            </div>
            {/* tip tap editor end */}
          </div>

          <div className="px-8 py-8 mb-6 bg-white rounded-md">
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6">
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
            </div>
          </div>

          <ShippingPrice register={register} errors={errors} />

          <div className="px-8 py-8 mb-6 bg-white rounded-md">
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-x-6">
              <FormField
                title="youtube video Id"
                isRequired={false}
                placeHolder="video id"
                bottomTitle="Set the video id of product."
                register={register}
                errors={errors}
              />
              {/* date picker start */}
              <div>
                <p className="mb-0 text-base text-black capitalize">
                  start and end date
                </p>
                <OfferDatePicker
                  offerDate={offerDate}
                  setOfferDate={setOfferDate}
                />
                <span className="leading-4 text-tiny">
                  set the product offer and end date
                </span>
              </div>
              {/* date picker start */}
            </div>
          </div>

          {/* additional information page start */}
          <AdditionalInformation
            setAdditionalInformation={setAdditionalInformation}
          />
          {/* additional information page end */}

          {/* product options start */}
          <ProductOptions setOptions={setOptions} isSubmitted={isSubmitted} />
          {/* product options end */}

          {/* product variations start */}
          <ProductVariants
            isSubmitted={isSubmitted}
            setImageURLs={setImageURLs}
          />
          {/* product variations end */}

          {/* SEO fields start */}
          <SEOFields
            register={register}
            errors={errors}
          />
          {/* SEO fields end */}
        </div>

        {/* right side */}
        <div className="col-span-12 xl:col-span-4 2xl:col-span-3">
          <ProductImgUpload
            imgUrl={img}
            setImgUrl={setImg}
            isSubmitted={isSubmitted}
          />

          <div className="px-8 py-8 mb-6 bg-white rounded-md">
            <p className="mb-5 text-base text-black">Product Category</p>
            {/* category start */}
            <div className="grid grid-cols-1 gap-3 mb-5 sm:grid-cols-1">
              <ProductCategory
                setCategory={setCategory}
                setParent={setParent}
                setChildren={setChildren}
              />
            </div>
          </div>

          <div className="px-8 py-8 mb-6 bg-white rounded-md">
            <p className="mb-5 text-base text-black">Product Tags</p>
            {/* tags start */}
            <div className="grid grid-cols-1 gap-3 mb-5 sm:grid-cols-1">
              <Tags tags={tags} setTags={setTags} />
            </div>
          </div>
        </div>
      </div>
      <button className="px-5 py-2 mt-5 tp-btn" type="submit">
        Submit Product
      </button>
    </form>
  );
};

export default ProductSubmit;
