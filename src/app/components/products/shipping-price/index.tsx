'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DollarSign } from 'lucide-react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Shipping Price Field */}
      <div className="space-y-2">
        <Label htmlFor="shipping-price" className="text-sm font-medium">
          Shipping Price
        </Label>
        <div className="relative">
          <Input
            {...register('shipping.price', {
              setValueAs: value => parseFloat(value || '0'),
            })}
            id="shipping-price"
            type="number"
            placeholder="0.00"
            defaultValue={defaultPrice}
            step="0.01"
            min="0"
            className={cn(
              'transition-all duration-200 pl-10',
              shippingErrors?.price
                ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                : 'focus:border-primary focus:ring-primary/20'
            )}
          />
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {shippingErrors?.price && (
          <ErrorMsg msg={String(shippingErrors.price.message || '')} />
        )}
      </div>

      {/* Shipping Description Field */}
      <div className="space-y-2">
        <Label htmlFor="shipping-description" className="text-sm font-medium">
          Shipping Description
        </Label>
        <textarea
          {...register('shipping.description')}
          id="shipping-description"
          placeholder="Enter shipping details"
          defaultValue={defaultDescription}
          rows={3}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none',
            shippingErrors?.description
              ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
              : 'focus:border-primary focus:ring-primary/20'
          )}
        />

        {shippingErrors?.description && (
          <ErrorMsg msg={String(shippingErrors.description.message || '')} />
        )}
      </div>
    </div>
  );
}
