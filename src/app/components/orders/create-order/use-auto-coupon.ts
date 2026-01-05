'use client';

import { useEffect, useCallback, useRef } from 'react';

interface CartItem {
  _id: string;
  title: string;
  price: number;
  finalPriceDiscount?: number;
  orderQuantity: number;
  [key: string]: any;
}

interface AppliedCoupon {
  _id?: string;
  couponCode: string;
  discount: number;
  discountType?: 'percentage' | 'fixed_amount';
  discountPercentage?: number;
  title?: string;
}

interface CouponData {
  _id: string;
  couponCode: string;
  status: string;
  discountAmount?: number;
  discountPercentage?: number;
  minimumAmount?: number;
  discountType?: 'percentage' | 'fixed_amount';
  title?: string;
}

interface UseAutoCouponParams {
  cartItems: CartItem[];
  appliedCoupons: AppliedCoupon[];
  shippingCost: number;
  onAddCoupon: (coupon: AppliedCoupon) => void;
  onUpdateCoupons: (coupons: AppliedCoupon[]) => void;
  onRemoveCoupon: (couponCode: string) => void;
  enabled?: boolean;
}

const DEBOUNCE_DELAY = 600; // Slightly longer for smoother UX

/**
 * Fetch active coupons from backend via Next.js API route (avoids CORS)
 */
const fetchActiveCoupons = async (): Promise<CouponData[]> => {
  try {
    // Use Next.js API route to proxy the request and avoid CORS issues
    const response = await fetch('/api/coupon/active', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data?.success && Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('[Auto-Coupon] Error fetching active coupons:', error);
    return [];
  }
};

/**
 * Select best available coupon based on priority:
 * 1. Higher discount amount
 * 2. Lower minimum amount (easier to qualify)
 * 3. Higher discount percentage
 */
const selectBestCoupon = (
  availableCoupons: CouponData[],
  appliedCoupons: AppliedCoupon[]
): CouponData | null => {
  // Filter out already applied coupons
  const unappliedCoupons = availableCoupons.filter(coupon => {
    const isAlreadyApplied = appliedCoupons.some(
      applied =>
        applied.couponCode?.toLowerCase() === coupon.couponCode?.toLowerCase()
    );
    return (
      !isAlreadyApplied &&
      coupon.status === 'active' &&
      coupon.couponCode
    );
  });

  if (unappliedCoupons.length === 0) {
    return null;
  }

  // Select best coupon based on priority
  const bestCoupon = unappliedCoupons.reduce((best, current) => {
    // Priority 1: Higher discount amount
    const bestDiscount = best.discountAmount || 0;
    const currentDiscount = current.discountAmount || 0;

    if (currentDiscount > bestDiscount) return current;
    if (currentDiscount < bestDiscount) return best;

    // Priority 2: Lower minimum amount (easier to qualify)
    const bestMinimum = best.minimumAmount || 0;
    const currentMinimum = current.minimumAmount || 0;

    if (currentMinimum < bestMinimum) return current;
    if (currentMinimum > bestMinimum) return best;

    // Priority 3: Higher discount percentage
    const bestPercentage = best.discountPercentage || 0;
    const currentPercentage = current.discountPercentage || 0;

    return currentPercentage > bestPercentage ? current : best;
  });

  return bestCoupon;
};

/**
 * Calculate cart totals for coupon validation
 */
const calculateCartTotals = (
  cartItems: CartItem[],
  shippingCost: number
) => {
  const subtotal = cartItems.reduce((total, item) => {
    const price = Number(item.finalPriceDiscount || item.price || 0);
    const quantity = Number(item.orderQuantity || 1);
    return total + price * quantity;
  }, 0);

  const cartTotal = subtotal + shippingCost;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    cartTotal: Math.round(cartTotal * 100) / 100,
    shipping: Math.round(shippingCost * 100) / 100,
  };
};

/**
 * Validate coupon with backend
 */
const validateCoupon = async (
  couponCode: string,
  cartItems: CartItem[],
  cartTotal: number,
  cartSubtotal: number,
  shippingCost: number,
  appliedCoupons: AppliedCoupon[]
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const endpoint =
      appliedCoupons.length === 0
        ? '/api/coupon/validate'
        : '/api/coupon/validate-multiple';

    const isMultiple = appliedCoupons.length > 0;

    const requestBody = isMultiple
      ? {
        couponCodes: [couponCode],
        cartItems: cartItems.map(item => ({
          _id: item._id,
          title: item.title,
          sku: item.sku,
          price: item.price,
          finalPriceDiscount: item.finalPriceDiscount || item.price,
          orderQuantity: item.orderQuantity,
          selectedOption: item.selectedOption,
          selectedConfigurations: item.selectedConfigurations,
          productConfigurations: item.productConfigurations,
        })),
        cartTotal,
        cartSubtotal,
        shippingCost,
        excludeAppliedCoupons: appliedCoupons.map(c => c.couponCode),
      }
      : {
        couponCode,
        cartItems: cartItems.map(item => ({
          _id: item._id,
          title: item.title,
          sku: item.sku,
          price: item.price,
          finalPriceDiscount: item.finalPriceDiscount || item.price,
          orderQuantity: item.orderQuantity,
          selectedOption: item.selectedOption,
          selectedConfigurations: item.selectedConfigurations,
          productConfigurations: item.productConfigurations,
        })),
        cartTotal,
        cartSubtotal,
        shippingCost,
      };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Auto-Coupon] Validation error:', error);
    return { success: false, message: 'Validation failed' };
  }
};

/**
 * Revalidate existing applied coupons when cart changes
 */
const revalidateAppliedCoupons = async (
  cartItems: CartItem[],
  appliedCoupons: AppliedCoupon[],
  shippingCost: number,
  onUpdateCoupons: (coupons: AppliedCoupon[]) => void
): Promise<void> => {
  if (appliedCoupons.length === 0 || cartItems.length === 0) {
    return;
  }

  try {
    const { cartTotal, subtotal, shipping } = calculateCartTotals(
      cartItems,
      shippingCost
    );

    const couponCodes = appliedCoupons.map(c => c.couponCode);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupon/validate-multiple`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCodes,
          cartItems: cartItems.map(item => ({
            _id: item._id,
            title: item.title,
            sku: item.sku,
            price: item.price,
            finalPriceDiscount: item.finalPriceDiscount || item.price,
            orderQuantity: item.orderQuantity,
            selectedOption: item.selectedOption,
            selectedConfigurations: item.selectedConfigurations,
            productConfigurations: item.productConfigurations,
          })),
          cartTotal,
          cartSubtotal: subtotal,
          shippingCost: shipping,
          excludeAppliedCoupons: [], // Don't exclude any since we're revalidating
        }),
      }
    );

    const data = await response.json();

    if (data.success && data.data?.appliedCoupons) {
      // Map validated coupons to our format
      const validatedCoupons = data.data.appliedCoupons.map((couponData: any) => ({
        _id: couponData.couponId || couponData._id,
        couponCode: couponData.couponCode,
        discount: couponData.discount || 0,
        discountType: couponData.discountType,
        discountPercentage: couponData.discountPercentage,
        title: couponData.title || couponData.couponCode,
      }));

      // Replace all coupons with validated ones (backend handles removal of invalid ones)
      onUpdateCoupons(validatedCoupons);
    } else {
      // All coupons invalid, clear them
      onUpdateCoupons([]);
    }
  } catch (error) {
    console.error('[Auto-Coupon] Revalidation error:', error);
    // Keep existing coupons on error - don't update
  }
};

/**
 * Custom hook for automatic coupon application
 * Automatically applies the best available coupon when cart changes
 * Also revalidates existing coupons when cart changes
 */
export const useAutoCoupon = ({
  cartItems,
  appliedCoupons,
  shippingCost,
  onAddCoupon,
  onUpdateCoupons,
  onRemoveCoupon,
  enabled = true,
}: UseAutoCouponParams) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const revalidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const previousCartRef = useRef<string>('');

  // Check if cart has changed
  const hasCartChanged = useCallback((currentCart: CartItem[]) => {
    const currentCartString = JSON.stringify(
      currentCart.map(item => ({
        id: item._id,
        quantity: item.orderQuantity,
        price: item.finalPriceDiscount || item.price,
      }))
    );
    const hasChanged = currentCartString !== previousCartRef.current;
    previousCartRef.current = currentCartString;
    return hasChanged;
  }, []);

  // Auto-apply coupon function
  const autoApplyCoupon = useCallback(async () => {
    // Skip if disabled, cart is empty, or already processing
    if (
      !enabled ||
      !cartItems ||
      cartItems.length === 0 ||
      isProcessingRef.current
    ) {
      return;
    }

    isProcessingRef.current = true;

    try {
      // Fetch active coupons
      const activeCoupons = await fetchActiveCoupons();

      if (activeCoupons.length === 0) {
        isProcessingRef.current = false;
        return;
      }

      // Select best available coupon
      const bestCoupon = selectBestCoupon(activeCoupons, appliedCoupons);

      if (!bestCoupon) {
        isProcessingRef.current = false;
        return;
      }

      // Calculate cart totals
      const { cartTotal, subtotal, shipping } = calculateCartTotals(
        cartItems,
        shippingCost
      );

      // Validate coupon with backend
      const validationResult = await validateCoupon(
        bestCoupon.couponCode,
        cartItems,
        cartTotal,
        subtotal,
        shipping,
        appliedCoupons
      );

      if (!validationResult.success || !validationResult.data) {
        // Silently fail - coupon may not meet requirements yet
        isProcessingRef.current = false;
        return;
      }

      // Extract coupon data from response
      let couponData: any = null;

      if (appliedCoupons.length === 0) {
        // Single coupon response
        couponData = validationResult.data.data || validationResult.data;
      } else {
        // Multiple coupons response
        const validationResults = validationResult.data.data?.validationResults || [];
        const result = validationResults.find(
          (r: any) => r.couponCode === bestCoupon.couponCode.toUpperCase() && r.success
        );

        if (result) {
          couponData = result;
        } else {
          // Fallback: try appliedCoupons array
          const appliedCoupon = validationResult.data.data?.appliedCoupons?.find(
            (c: any) => c.couponCode === bestCoupon.couponCode.toUpperCase()
          );
          couponData = appliedCoupon;
        }
      }

      if (couponData) {
        // Check if coupon is already applied to avoid duplicates
        const couponCodeToApply = couponData.couponCode || bestCoupon.couponCode;
        const isAlreadyApplied = appliedCoupons.some(
          c => c.couponCode.toLowerCase() === couponCodeToApply.toLowerCase()
        );

        if (!isAlreadyApplied) {
          // Apply the coupon silently (no toast notification for auto-apply)
          onAddCoupon({
            _id: couponData.couponId || couponData._id || bestCoupon._id,
            couponCode: couponCodeToApply,
            discount: couponData.discount || 0,
            discountType: couponData.discountType || bestCoupon.discountType,
            discountPercentage: couponData.discountPercentage || bestCoupon.discountPercentage,
            title: couponData.title || bestCoupon.title || couponCodeToApply,
          });
        }
      }
    } catch (error) {
      console.error('[Auto-Coupon] Error in auto-apply:', error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [cartItems, appliedCoupons, shippingCost, onAddCoupon, enabled]);

  // Revalidate existing coupons when cart changes
  const handleRevalidation = useCallback(async () => {
    if (!enabled || cartItems.length === 0 || appliedCoupons.length === 0) {
      return;
    }

    // Clear existing revalidation timeout
    if (revalidationTimeoutRef.current) {
      clearTimeout(revalidationTimeoutRef.current);
    }

    // Debounce revalidation
    revalidationTimeoutRef.current = setTimeout(() => {
      revalidateAppliedCoupons(
        cartItems,
        appliedCoupons,
        shippingCost,
        onUpdateCoupons
      );
    }, DEBOUNCE_DELAY);
  }, [cartItems, appliedCoupons, shippingCost, onUpdateCoupons, enabled]);

  // Debounced auto-apply and revalidation effect - triggers on cart changes
  useEffect(() => {
    // Skip if disabled
    if (!enabled) {
      return;
    }

    const cartChanged = hasCartChanged(cartItems);

    // If cart hasn't changed, skip
    if (!cartChanged) {
      return;
    }

    // If we have applied coupons, revalidate them first to get updated discount amounts
    if (appliedCoupons.length > 0) {
      handleRevalidation();
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced auto-apply (for new coupons)
    // This runs after revalidation to potentially add more coupons
    timeoutRef.current = setTimeout(() => {
      autoApplyCoupon();
    }, DEBOUNCE_DELAY + 100); // Slightly longer delay to allow revalidation to complete first

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cartItems, appliedCoupons.length, enabled, hasCartChanged, autoApplyCoupon, handleRevalidation]);

  // Trigger auto-apply immediately when enabled and cart has items but no coupons
  // This handles the case when user moves to summary step
  useEffect(() => {
    if (
      enabled &&
      cartItems.length > 0 &&
      appliedCoupons.length === 0 &&
      !isProcessingRef.current
    ) {
      // Small delay to ensure cart state is stable
      const immediateTimeout = setTimeout(() => {
        autoApplyCoupon();
      }, 300);

      return () => clearTimeout(immediateTimeout);
    }
  }, [enabled, cartItems.length, appliedCoupons.length, autoApplyCoupon]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (revalidationTimeoutRef.current) {
        clearTimeout(revalidationTimeoutRef.current);
      }
    };
  }, []);

  return {
    autoApplyCoupon,
  };
};

