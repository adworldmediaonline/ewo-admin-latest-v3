'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IProduct } from '@/types/product';
import { useMemo } from 'react';
import Image from 'next/image';

interface CartItem extends IProduct {
  orderQuantity: number;
  selectedOption?: any;
  selectedConfigurations?: any;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  shippingCost: number;
  onShippingCostChange: (cost: number) => void;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function OrderSummary({
  cartItems,
  shippingCost,
  onShippingCostChange,
  paymentMethod,
  onPaymentMethodChange,
  onSubmit,
  isSubmitting,
}: OrderSummaryProps) {
  // Calculate subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.finalPriceDiscount || item.price || 0);
      return sum + price * item.orderQuantity;
    }, 0);
  }, [cartItems]);

  // Calculate final total
  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal + shippingCost);
  }, [subtotal, shippingCost]);

  // Check free shipping eligibility
  const isFreeShippingEligible = subtotal >= 500;

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
                const itemPrice = Number(item.finalPriceDiscount || item.price || 0);
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
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.orderQuantity} × ${itemPrice.toFixed(2)}
                      </p>
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
        <div className="space-y-2 border-t pt-4">
          <label className="text-sm font-medium">
            Payment Method <span className="text-destructive">*</span>
          </label>
          <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COD">Cash on Delivery (COD)</SelectItem>
              <SelectItem value="Free Order (100% Discount)">
                Free Order (100% Discount)
              </SelectItem>
              <SelectItem value="Card">Card (Mark as Paid)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={cartItems.length === 0 || !paymentMethod || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Creating Order...' : `Create Order - $${totalAmount.toFixed(2)}`}
        </Button>
      </CardContent>
    </Card>
  );
}

