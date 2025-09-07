'use client';
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import ErrorMsg from '../../common/error-msg';

interface ShippingPriceProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  defaultPrice?: number;
  defaultDescription?: string;
}

export default function ShippingPrice({
  register,
  errors,
  defaultPrice = 0,
  defaultDescription = '',
}: ShippingPriceProps) {
  // Safe access to nested error messages
  const shippingErrors =
    errors && errors.shipping
      ? (errors.shipping as Record<string, any>)
      : undefined;

  return (
    <div className="px-8 py-8 mb-6 bg-white rounded-md">
      <h4 className="mb-5 text-[18px] text-black">Shipping Information</h4>
      <div className="grid sm:grid-cols-2 gap-x-6">
        <div className="mb-5">
          <p className="mb-0 text-base text-black capitalize">Shipping Price</p>
          <input
            {...register('shipping.price', {
              setValueAs: value => parseFloat(value || '0'),
            })}
            className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base"
            type="number"
            placeholder="Enter shipping price"
            defaultValue={defaultPrice}
            step="0.01"
          />
          <span className="leading-4 text-tiny">Set the shipping price</span>
          {shippingErrors?.price && (
            <ErrorMsg msg={String(shippingErrors.price.message || '')} />
          )}
        </div>
        <div className="mb-5">
          <p className="mb-0 text-base text-black capitalize">
            Shipping Description
          </p>
          <input
            {...register('shipping.description')}
            className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base"
            type="text"
            placeholder="Enter shipping details"
            defaultValue={defaultDescription}
          />
          <span className="leading-4 text-tiny">
            Describe shipping policy or details
          </span>
          {shippingErrors?.description && (
            <ErrorMsg msg={String(shippingErrors.description.message || '')} />
          )}
        </div>
      </div>
    </div>
  );
}
