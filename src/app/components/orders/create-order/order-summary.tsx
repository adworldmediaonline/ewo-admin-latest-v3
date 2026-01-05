'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { IProduct } from '@/types/product';
import { useMemo, useState, useRef } from 'react';
import Image from 'next/image';
import { X, Tag, Loader2 } from 'lucide-react';
import { useValidateCouponMutation } from '@/redux/coupon/couponApi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

interface CartItem extends IProduct {
  orderQuantity: number;
  selectedOption?: any;
  selectedConfigurations?: any;
  basePrice?: number;
  customPrice?: number;
}

interface AppliedCoupon {
  _id?: string;
  couponCode: string;
  discount: number;
  discountType?: 'percentage' | 'fixed_amount';
  discountPercentage?: number;
  title?: string;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  shippingCost: number;
  onShippingCostChange: (cost: number) => void;
  appliedCoupons: AppliedCoupon[];
  onAddCoupon: (coupon: AppliedCoupon) => void;
  onRemoveCoupon: (couponCode: string) => void;
  onUpdatePrice?: (productId: string, price: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  cardError?: string;
  onCardErrorChange?: (error: string) => void;
}

export default function OrderSummary({
  cartItems,
  shippingCost,
  onShippingCostChange,
  appliedCoupons,
  onAddCoupon,
  onRemoveCoupon,
  onUpdatePrice,
  onSubmit,
  isSubmitting,
  cardError,
  onCardErrorChange,
}: OrderSummaryProps) {
  const [couponCode, setCouponCode] = useState('');
  const couponInputRef = useRef<HTMLInputElement>(null);
  const [validateCoupon, { isLoading: isValidatingCoupon }] = useValidateCouponMutation();
  const stripe = useStripe();
  const elements = useElements();

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.finalPriceDiscount || item.price || 0);
      return sum + price * item.orderQuantity;
    }, 0);
  }, [cartItems]);

  // Calculate coupon discount
  const couponDiscount = useMemo(() => {
    return appliedCoupons.reduce((sum, coupon) => {
      return sum + (coupon.discount || 0);
    }, 0);
  }, [appliedCoupons]);

  // Calculate final total
  const totalAmount = useMemo(() => {
    const afterCoupon = Math.max(0, subtotal - couponDiscount);
    return Math.max(0, afterCoupon + shippingCost);
  }, [subtotal, couponDiscount, shippingCost]);

  // Check free shipping eligibility
  const isFreeShippingEligible = subtotal >= 500;

  // Handle coupon submission
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim();

    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }

    // Check if coupon already applied
    if (appliedCoupons.some(c => c.couponCode.toLowerCase() === code.toLowerCase())) {
      toast.error('This coupon is already applied');
      setCouponCode('');
      return;
    }

    try {
      const totals = {
        subtotal,
        shipping: isFreeShippingEligible ? 0 : shippingCost,
      };

      // Prepare cart items for validation
      const cartItemsForValidation = cartItems.map(item => ({
        _id: item._id,
        title: item.title,
        sku: item.sku,
        price: item.price,
        finalPriceDiscount: item.finalPriceDiscount || item.price,
        orderQuantity: item.orderQuantity,
        selectedOption: item.selectedOption,
        selectedConfigurations: item.selectedConfigurations,
        productConfigurations: item.productConfigurations,
      }));

      const requestBody = appliedCoupons.length === 0
        ? {
            couponCode: code,
            cartItems: cartItemsForValidation,
            cartTotal: totals.subtotal + totals.shipping,
            cartSubtotal: totals.subtotal,
            shippingCost: totals.shipping,
          }
        : {
            couponCodes: [code],
            cartItems: cartItemsForValidation,
            cartTotal: totals.subtotal + totals.shipping - couponDiscount,
            cartSubtotal: totals.subtotal - couponDiscount,
            shippingCost: totals.shipping,
            excludeAppliedCoupons: appliedCoupons.map(c => c.couponCode),
          };

      const endpoint = appliedCoupons.length === 0
        ? '/api/coupon/validate'
        : '/api/coupon/validate-multiple';

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        let couponData;

        if (appliedCoupons.length === 0) {
          // First coupon - use single validation endpoint response
          couponData = data.data;
        } else {
          // Multiple coupons - extract from validationResults
          const validationResult = data.data?.validationResults?.find(
            (result: any) => result.couponCode === code.toUpperCase() && result.success
          );

          if (validationResult) {
            couponData = {
              couponCode: validationResult.couponCode,
              discount: validationResult.discount,
              discountType: validationResult.discountType,
              discountPercentage: validationResult.discountPercentage,
              title: validationResult.title || validationResult.couponCode,
              couponId: validationResult.couponId || validationResult._id,
            };
          } else {
            // Fallback: try to find in appliedCoupons array
            const appliedCoupon = data.data?.appliedCoupons?.find(
              (c: any) => c.couponCode === code.toUpperCase()
            );
            couponData = appliedCoupon;
          }
        }

        if (couponData) {
          onAddCoupon({
            _id: couponData.couponId || couponData._id,
            couponCode: couponData.couponCode || code.toUpperCase(),
            discount: couponData.discount || 0,
            discountType: couponData.discountType,
            discountPercentage: couponData.discountPercentage,
            title: couponData.title || couponData.couponCode || code,
          });
          toast.success(`Coupon "${code}" applied successfully! You saved $${(couponData.discount || 0).toFixed(2)}`);
          setCouponCode('');
          if (couponInputRef.current) {
            couponInputRef.current.value = '';
          }
        } else {
          toast.error('Invalid coupon response');
        }
      } else {
        // Handle validation errors for multiple coupons
        if (appliedCoupons.length > 0 && data.data?.validationResults) {
          const errorResult = data.data.validationResults.find(
            (result: any) => result.couponCode === code.toUpperCase()
          );
          toast.error(errorResult?.message || data.message || 'Invalid coupon code');
        } else {
          toast.error(data.message || 'Invalid coupon code');
        }
      }
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      toast.error('Failed to validate coupon. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Applied Coupons - Always Visible at Top */}
        {appliedCoupons.length > 0 && (
          <div className="space-y-3 border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Applied Coupons</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                Auto-applied
              </span>
            </div>

            <div className="space-y-2">
              {appliedCoupons.map((coupon, index) => {
                const discountPercent = coupon.discountType === 'percentage' && coupon.discountPercentage
                  ? coupon.discountPercentage
                  : coupon.discount && subtotal > 0
                    ? ((coupon.discount / subtotal) * 100).toFixed(1)
                    : null;

                return (
                  <div
                    key={coupon.couponCode || index}
                    className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-lg p-3 shadow-sm"
                  >
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                          <Tag className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-wider">
                            {coupon.couponCode}
                          </p>
                          {discountPercent && (
                            <p className="text-xs text-white/90 font-medium">
                              {discountPercent}% OFF
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          -${Number(coupon.discount || 0).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveCoupon(coupon.couponCode)}
                          className="text-white hover:text-white/80 transition-colors"
                          aria-label={`Remove coupon ${coupon.couponCode}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Items ({cartItems.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cartItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No items in cart
              </p>
            ) : (
              cartItems.map(item => {
                const hasConfigurations =
                  item.productConfigurations &&
                  item.productConfigurations.length > 0 &&
                  item.productConfigurations.some(
                    (config: any) => config.options && config.options.length > 0
                  );
                const itemPrice = Number(
                  item.customPrice !== undefined
                    ? item.customPrice
                    : (item.finalPriceDiscount || item.price || 0)
                );
                const itemTotal = itemPrice * item.orderQuantity;

                return (
                  <div
                    key={item._id}
                    className="flex items-start gap-3 p-2 border rounded-lg"
                  >
                    <div className="relative w-12 h-12 rounded overflow-hidden bg-muted shrink-0">
                      {item.imageURLs?.[0] ? (
                        <Image
                          src={item.imageURLs[0]}
                          alt={item.title || 'Product'}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Qty: {item.orderQuantity} ×
                        </span>
                        {onUpdatePrice && !hasConfigurations ? (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={itemPrice}
                            onChange={e => {
                              const newPrice = parseFloat(e.target.value) || 0;
                              onUpdatePrice(item._id, newPrice);
                            }}
                            className="h-6 w-20 text-xs"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            ${itemPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-medium shrink-0">
                      ${itemTotal.toFixed(2)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coupon Input Section */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Add Coupon</h3>
          </div>

          {/* Coupon Input */}
          <form onSubmit={handleCouponSubmit} className="flex gap-2">
            <Input
              ref={couponInputRef}
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              disabled={isValidatingCoupon}
              className="flex-1"
            />
            <Button
              type="submit"
              variant="outline"
              disabled={!couponCode.trim() || isValidatingCoupon}
              size="default"
            >
              {isValidatingCoupon ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </form>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Coupon Discount</span>
              <span className="font-medium text-green-600">
                -${couponDiscount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Shipping</span>
              {isFreeShippingEligible && (
                <span className="text-xs text-green-600">(Free on orders $500+)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isFreeShippingEligible ? (
                <span className="font-bold text-green-600">FREE</span>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingCost}
                    onChange={e => onShippingCostChange(Number(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                  <span className="text-xs text-muted-foreground">USD</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between text-lg font-semibold border-t pt-2 mt-2">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mt-6 border-t pt-4">
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-md bg-background">
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="radio"
                  id="card-payment"
                  name="paymentMethod"
                  value="card"
                  defaultChecked
                  className="text-primary focus:ring-ring"
                />
                <label
                  htmlFor="card-payment"
                  className="font-medium text-foreground"
                >
                  Credit / Debit Card
                </label>
              </div>

              {stripe && elements ? (
                <div className="bg-background border border-border rounded-md p-3">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#374151',
                          '::placeholder': {
                            color: '#9CA3AF',
                          },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="bg-background border border-border rounded-md p-3">
                  <div className="text-sm text-muted-foreground">
                    Loading payment form...
                  </div>
                </div>
              )}

              {cardError && (
                <div className="mt-2 text-sm text-destructive">{cardError}</div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={cartItems.length === 0 || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Creating Order...' : `Create Order - $${totalAmount.toFixed(2)}`}
        </Button>
      </CardContent>
    </Card>
  );
}

