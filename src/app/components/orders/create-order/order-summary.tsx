'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { IProduct } from '@/types/product';
import { useMemo } from 'react';
import Image from 'next/image';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

interface CartItem extends IProduct {
  orderQuantity: number;
  selectedOption?: any;
  selectedConfigurations?: any;
  basePrice?: number;
  customPrice?: number;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  shippingCost: number;
  onShippingCostChange: (cost: number) => void;
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
  onUpdatePrice,
  onSubmit,
  isSubmitting,
  cardError,
  onCardErrorChange,
}: OrderSummaryProps) {
  const stripe = useStripe();
  const elements = useElements();

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(
        item.customPrice !== undefined
          ? item.customPrice
          : (item.finalPriceDiscount || item.price || 0)
      );
      return sum + price * item.orderQuantity;
    }, 0);
  }, [cartItems]);

  // Calculate shipping cost from individual product shipping prices
  const calculatedShippingCost = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const productShippingPrice = item.shipping?.price || 0;
      return sum + productShippingPrice * item.orderQuantity;
    }, 0);
  }, [cartItems]);

  // Calculate base shipping cost (before free shipping check)
  const baseShippingCost = useMemo(() => {
    return shippingCost > 0 ? shippingCost : calculatedShippingCost;
  }, [shippingCost, calculatedShippingCost]);

  // Check free shipping eligibility
  // Free shipping applies when Subtotal >= 500 (matches frontend logic)
  const isFreeShippingEligible = useMemo(() => {
    return subtotal >= 500;
  }, [subtotal]);

  // Final shipping cost (0 if eligible, otherwise use calculated/manual shipping)
  const finalShippingCost = useMemo(() => {
    return isFreeShippingEligible ? 0 : baseShippingCost;
  }, [isFreeShippingEligible, baseShippingCost]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return subtotal + finalShippingCost;
  }, [subtotal, finalShippingCost]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-2">
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
                        {item.shipping?.price !== undefined && item.shipping.price > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Shipping: ${(item.shipping.price * item.orderQuantity).toFixed(2)}
                            {item.orderQuantity > 1 && (
                              <span className="ml-1">
                                (${item.shipping.price.toFixed(2)} × {item.orderQuantity})
                              </span>
                            )}
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

        {/* Pricing Breakdown */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Shipping</span>
                {isFreeShippingEligible && (
                  <span className="text-xs text-green-600">(Free on orders $500+)</span>
                )}
              </div>
              {!isFreeShippingEligible && calculatedShippingCost > 0 && shippingCost === 0 && (
                <span className="text-xs text-muted-foreground">
                  Calculated from product shipping prices
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isFreeShippingEligible ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-green-600">FREE</span>
                  <span className="text-xs text-green-600">(Orders $500+)</span>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={shippingCost || calculatedShippingCost}
                      onChange={e => onShippingCostChange(Number(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border rounded text-sm"
                    />
                    <span className="text-xs text-muted-foreground">USD</span>
                  </div>
                  {calculatedShippingCost > 0 && shippingCost === 0 && (
                    <span className="text-xs text-muted-foreground">
                      Auto: ${calculatedShippingCost.toFixed(2)}
                    </span>
                  )}
                  {subtotal > 0 && subtotal < 500 && (
                    <span className="text-xs text-blue-600">
                      Free shipping on orders $500+
                    </span>
                  )}
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

