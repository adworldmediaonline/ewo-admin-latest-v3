'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateOrderMutation, useCreatePaymentIntentMutation } from '@/redux/order/orderApi';
import { IProduct } from '@/types/product';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ProductSelection from '@/app/components/orders/create-order/product-selection';
import CustomerForm from '@/app/components/orders/create-order/customer-form';
import OrderSummary from '@/app/components/orders/create-order/order-summary';
import { useAutoCoupon } from '@/app/components/orders/create-order/use-auto-coupon';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Tag, X } from 'lucide-react';

interface CartItem extends IProduct {
  orderQuantity: number;
  selectedOption?: any;
  selectedConfigurations?: any;
  basePrice?: number;
  productConfigurations?: any;
  customPrice?: number;
}

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  contactNo: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface AppliedCoupon {
  _id?: string;
  couponCode: string;
  discount: number;
  discountType?: 'percentage' | 'fixed_amount';
  discountPercentage?: number;
  title?: string;
}

type Step = 'products' | 'customer' | 'summary';

export default function CreateOrderPage() {
  const router = useRouter();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState<Step>('products');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerData, setCustomerData] = useState<CustomerFormData | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  // Default payment method is "Card" to match frontend
  const paymentMethod = 'Card';
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([]);
  const [cardError, setCardError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(
      item.customPrice !== undefined
        ? item.customPrice
        : (item.finalPriceDiscount || item.price || 0)
    );
    return sum + price * item.orderQuantity;
  }, 0);

  // Calculate shipping cost from individual product shipping prices
  const calculatedShippingCost = cartItems.reduce((sum, item) => {
    const productShippingPrice = item.shipping?.price || 0;
    return sum + productShippingPrice * item.orderQuantity;
  }, 0);

  // Use calculated shipping or manual override (if manually set)
  const productBasedShippingCost = calculatedShippingCost;

  // Calculate coupon discount
  const couponDiscount = appliedCoupons.reduce((sum, coupon) => {
    return sum + (coupon.discount || 0);
  }, 0);

  // Calculate shipping cost (before free shipping check)
  const baseShippingCost = shippingCost > 0 ? shippingCost : productBasedShippingCost;

  // Calculate subtotal after discount (discounts apply only to product subtotal)
  const subtotalAfterDiscount = Math.max(0, subtotal - couponDiscount);

  // Check free shipping eligibility
  // Free shipping applies ONLY when (Subtotal - Discount) > 500
  // Note: Shipping charges are NOT included in the eligibility check
  // Edge cases handled:
  // - If discount > subtotal, subtotalAfterDiscount becomes 0 (Math.max ensures non-negative)
  // - If subtotalAfterDiscount exactly equals 500, free shipping does NOT apply (> 500, not >= 500)
  const isFreeShippingEligible = subtotalAfterDiscount > 500;

  // Final shipping cost (0 if eligible, otherwise use calculated/manual shipping)
  const finalShippingCost = isFreeShippingEligible ? 0 : baseShippingCost;

  // Auto-apply coupons when cart changes
  const handleAddCoupon = (coupon: AppliedCoupon) => {
    // Check if coupon is already applied to avoid duplicates
    const isAlreadyApplied = appliedCoupons.some(
      c => c.couponCode.toLowerCase() === coupon.couponCode.toLowerCase()
    );
    if (!isAlreadyApplied) {
      setAppliedCoupons(prev => [...prev, coupon]);
    }
  };

  const handleRemoveCoupon = (couponCode: string) => {
    setAppliedCoupons(prev => prev.filter(c => c.couponCode !== couponCode));
  };

  const handleUpdateCoupons = (coupons: AppliedCoupon[]) => {
    setAppliedCoupons(coupons);
  };

  // Clear coupons when cart becomes empty
  useEffect(() => {
    if (cartItems.length === 0 && appliedCoupons.length > 0) {
      setAppliedCoupons([]);
    }
  }, [cartItems.length, appliedCoupons.length]);

  // Enable auto-coupon when cart has items (works on all steps, but mainly for summary)
  // This ensures coupons are applied as soon as products are added and revalidated when cart changes
  useAutoCoupon({
    cartItems,
    appliedCoupons,
    shippingCost: finalShippingCost,
    onAddCoupon: handleAddCoupon,
    onUpdateCoupons: handleUpdateCoupons,
    onRemoveCoupon: handleRemoveCoupon,
    enabled: cartItems.length > 0,
  });

  // Calculate total amount (after coupons)
  // Discounts are applied to subtotal first, then shipping is added
  const totalAmount = subtotalAfterDiscount + finalShippingCost;

  const handleAddProduct = (product: IProduct & {
    selectedOption?: any;
    selectedConfigurations?: any;
    finalPriceDiscount?: number;
    basePrice?: number;
    productConfigurations?: any;
    customPrice?: number;
  }) => {
    const existingItem = cartItems.find(item => item._id === product._id);

    // Check if product has same options/configurations
    const hasSameConfig = existingItem && (
      JSON.stringify(existingItem.selectedOption) === JSON.stringify(product.selectedOption) &&
      JSON.stringify(existingItem.selectedConfigurations) === JSON.stringify(product.selectedConfigurations)
    );

    if (existingItem && hasSameConfig) {
      handleUpdateQuantity(product._id, existingItem.orderQuantity + 1);
    } else {
      // Add as new item (different configuration) or new product
      const priceToUse = product.customPrice !== undefined
        ? product.customPrice
        : (product.finalPriceDiscount || product.price);

      setCartItems([
        ...cartItems,
        {
          ...product,
          orderQuantity: 1,
          finalPriceDiscount: priceToUse,
          basePrice: product.basePrice || product.price,
          customPrice: product.customPrice,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems(
      cartItems.map(item =>
        item._id === productId ? { ...item, orderQuantity: quantity } : item
      )
    );
  };

  const handleUpdatePrice = (productId: string, price: number) => {
    setCartItems(
      cartItems.map(item =>
        item._id === productId
          ? {
            ...item,
            customPrice: price,
            finalPriceDiscount: price,
          }
          : item
      )
    );
  };

  const handleRemoveProduct = (productId: string) => {
    setCartItems(cartItems.filter(item => item._id !== productId));
  };

  const handleCustomerSubmit = (data: CustomerFormData) => {
    setCustomerData(data);
    setStep('summary');
  };

  const handleCreateOrder = async () => {
    if (!customerData) {
      toast.error('Customer information is required');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }


    // Prepare cart items in the format expected by backend
    const cart = cartItems.map(item => {
      const priceToUse = item.customPrice !== undefined
        ? item.customPrice
        : (item.finalPriceDiscount || item.price || 0);

      return {
        _id: item._id,
        title: item.title,
        sku: item.sku,
        img: item.imageURLs?.[0] || '',
        price: Number(priceToUse),
        finalPriceDiscount: Number(priceToUse),
        orderQuantity: item.orderQuantity,
        quantity: item.quantity || 0,
        selectedOption: item.selectedOption || null,
        selectedConfigurations: item.selectedConfigurations || undefined,
        productConfigurations: item.productConfigurations || undefined,
        basePrice: Number(item.basePrice || item.price || 0),
        updatedPrice: Number(priceToUse),
        shipping: item.shipping || {},
      };
    });

    // Prepare base order data
    const orderData = {
      // Customer information
      name: `${customerData.firstName} ${customerData.lastName}`.trim(),
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      contact: customerData.contactNo,
      address: customerData.address,
      city: customerData.city,
      state: customerData.state,
      country: customerData.country,
      zipCode: customerData.zipCode,

      // Order items
      cart: cart,

      // Pricing
      subTotal: subtotal,
      shippingCost: finalShippingCost,
      discount: couponDiscount,
      totalAmount: totalAmount,

      // Payment
      paymentMethod: paymentMethod,
      shippingOption: 'calculated',

      // Guest order (admin created orders don't have user)
      isGuestOrder: true,

      // Applied coupons
      appliedCoupons: appliedCoupons.map(coupon => ({
        _id: coupon._id,
        couponCode: coupon.couponCode,
        discount: coupon.discount,
        discountType: coupon.discountType,
        discountPercentage: coupon.discountPercentage,
        title: coupon.title || coupon.couponCode,
      })),
    };

    try {
      // Handle Free Order (100% discount) - if total is 0, treat as free order
      if (totalAmount === 0) {
        const result = await createOrder({
          ...orderData,
          paymentMethod: 'Free Order (100% Discount)',
          isPaid: true,
          paidAt: new Date(),
          paymentInfo: {
            id: `free_order_${Date.now()}`,
            status: 'succeeded',
            amount_received: 0,
            currency: 'usd',
            payment_method_types: ['coupon'],
          },
        }).unwrap();

        if (result.success) {
          toast.success('Free order created successfully!');
          router.push(`/dashboard/admin/orders`);
        } else {
          toast.error(result.message || 'Failed to create order');
        }
        return;
      }

      // Handle Card Payment with Stripe (default payment method)
      if (!stripe || !elements) {
        toast.error('Stripe is not initialized. Please refresh the page.');
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast.error('Please enter your card information');
        return;
      }

      setProcessingPayment(true);
      setCardError('');

      try {
        // Step 1: Create payment method
        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

        if (pmError) {
          setCardError(pmError.message || 'Card error occurred');
          toast.error(`Card error: ${pmError.message || 'Unknown error'}`);
          setProcessingPayment(false);
          return;
        }

        // Step 2: Create payment intent
        const paymentIntentResult = await createPaymentIntent({
          price: Math.max(0, Math.round(totalAmount * 100)), // Convert to cents
          email: customerData.email,
          cart: cart,
          orderData: {
            ...orderData,
            totalAmount: totalAmount,
          },
        }).unwrap();

        // Handle free orders (100% discount coupons)
        if (paymentIntentResult.isFreeOrder) {
          const result = await createOrder({
            ...orderData,
            paymentMethod: 'Free Order (100% Discount)',
            isPaid: true,
            paidAt: new Date(),
            paymentInfo: {
              id: `free_order_${Date.now()}`,
              status: 'succeeded',
              amount_received: 0,
              currency: 'usd',
              payment_method_types: ['coupon'],
            },
          }).unwrap();

          if (result.success) {
            toast.success('Free order created successfully!');
            router.push(`/dashboard/admin/orders`);
          } else {
            toast.error(result.message || 'Failed to create order');
          }
          setProcessingPayment(false);
          return;
        }

        const clientSecret = paymentIntentResult.clientSecret;
        if (!clientSecret) {
          throw new Error('Failed to get client secret from payment intent');
        }

        // Step 3: Confirm payment
        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: orderData.name,
                email: orderData.email,
              },
            },
          }
        );

        if (confirmError) {
          let errorMessage = confirmError.message;
          if (confirmError.type === 'card_error') {
            if (confirmError.code === 'card_declined') {
              errorMessage = 'Your card was declined. Please use a different card.';
            } else if (confirmError.code === 'expired_card') {
              errorMessage = 'Your card has expired. Please use a different card.';
            } else if (confirmError.code === 'incorrect_cvc') {
              errorMessage = 'The security code (CVC) is incorrect. Please check and try again.';
            } else if (confirmError.code === 'processing_error') {
              errorMessage = 'An error occurred while processing your card. Please try again.';
            }
          }
          setCardError(errorMessage || 'Payment failed');
          toast.error(`Payment failed: ${errorMessage || 'Unknown error'}`);
          setProcessingPayment(false);
          return;
        }

        // Step 4: Payment succeeded - create order
        if (paymentIntent.status === 'succeeded') {
          const result = await createOrder({
            ...orderData,
            paymentInfo: paymentIntent,
            isPaid: true,
            paidAt: new Date(),
          }).unwrap();

          if (result.success) {
            toast.success('Order created and payment processed successfully!');
            router.push(`/dashboard/admin/orders`);
          } else {
            toast.error(result.message || 'Failed to create order');
          }
        } else {
          toast.error(`Payment not completed. Status: ${paymentIntent.status}`);
        }

        setProcessingPayment(false);
      } catch (error: any) {
        console.error('Payment processing error:', error);
        toast.error(error?.data?.message || 'Error processing payment. Please try again.');
        setProcessingPayment(false);
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error?.data?.message || 'Failed to create order. Please try again.');
      setProcessingPayment(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create New Order</h1>
          <p className="text-muted-foreground mt-1">
            Create an order manually from the admin panel
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-2 ${step === 'products' ? 'text-primary font-semibold' : 'text-muted-foreground'
            }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'products'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
              }`}
          >
            1
          </div>
          <span>Select Products</span>
        </div>
        <div className="h-px flex-1 bg-border" />
        <div
          className={`flex items-center gap-2 ${step === 'customer' ? 'text-primary font-semibold' : 'text-muted-foreground'
            }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'customer'
              ? 'bg-primary text-primary-foreground'
              : step === 'summary'
                ? 'bg-green-500 text-white'
                : 'bg-muted text-muted-foreground'
              }`}
          >
            2
          </div>
          <span>Customer Info</span>
        </div>
        <div className="h-px flex-1 bg-border" />
        <div
          className={`flex items-center gap-2 ${step === 'summary' ? 'text-primary font-semibold' : 'text-muted-foreground'
            }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'summary'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
              }`}
          >
            3
          </div>
          <span>Review & Create</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {step === 'products' && (
            <Card>
              <CardHeader>
                <CardTitle>Select Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductSelection
                  cartItems={cartItems}
                  onAddProduct={handleAddProduct}
                  onUpdateQuantity={handleUpdateQuantity}
                  onUpdatePrice={handleUpdatePrice}
                  onRemoveProduct={handleRemoveProduct}
                  appliedCoupons={appliedCoupons}
                  subtotal={subtotal}
                  onRemoveCoupon={handleRemoveCoupon}
                />
                {cartItems.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <Button
                      onClick={() => setStep('customer')}
                      className="w-full"
                      size="lg"
                    >
                      Continue to Customer Information ({cartItems.length} items)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 'customer' && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerForm
                  onSubmit={handleCustomerSubmit}
                  defaultValues={customerData || undefined}
                  appliedCoupons={appliedCoupons}
                  subtotal={subtotal}
                  onRemoveCoupon={handleRemoveCoupon}
                />
                <div className="mt-4 flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('products')}
                    className="flex-1"
                  >
                    ← Back to Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'summary' && customerData && (
            <Card>
              <CardHeader>
                <CardTitle>Review Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info Display */}
                <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>{' '}
                      <span className="font-medium">
                        {customerData.firstName} {customerData.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>{' '}
                      <span className="font-medium">{customerData.email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>{' '}
                      <span className="font-medium">{customerData.contactNo}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Address:</span>{' '}
                      <span className="font-medium">{customerData.address}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">City:</span>{' '}
                      <span className="font-medium">{customerData.city}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">State:</span>{' '}
                      <span className="font-medium">{customerData.state}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Country:</span>{' '}
                      <span className="font-medium">{customerData.country}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ZIP:</span>{' '}
                      <span className="font-medium">{customerData.zipCode}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items Display */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {cartItems.map(item => {
                      const itemPrice = Number(item.finalPriceDiscount || item.price || 0);
                      const itemTotal = itemPrice * item.orderQuantity;

                      return (
                        <div
                          key={item._id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded overflow-hidden bg-muted">
                              {item.imageURLs?.[0] ? (
                                <Image
                                  src={item.imageURLs[0]}
                                  alt={item.title || 'Product'}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.orderQuantity} × ${itemPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium">
                            ${itemTotal.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('customer')}
                    className="flex-1"
                  >
                    ← Back to Customer Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Order Summary */}
        <div className="lg:col-span-1">
          {step === 'summary' && customerData ? (
            <OrderSummary
              cartItems={cartItems}
              shippingCost={shippingCost}
              onShippingCostChange={setShippingCost}
              appliedCoupons={appliedCoupons}
              onAddCoupon={handleAddCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onUpdatePrice={handleUpdatePrice}
              onSubmit={handleCreateOrder}
              isSubmitting={isCreating || processingPayment}
              cardError={cardError}
              onCardErrorChange={setCardError}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Applied Coupons Display */}
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
                                  onClick={() => handleRemoveCoupon(coupon.couponCode)}
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

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-medium">{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      ${subtotal.toFixed(2)}
                    </span>
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
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Shipping</span>
                      {!isFreeShippingEligible && productBasedShippingCost > 0 && shippingCost === 0 && (
                        <span className="text-xs text-muted-foreground">
                          Calculated from products
                        </span>
                      )}
                    </div>
                    <span className="font-medium">
                      {isFreeShippingEligible ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `$${(shippingCost > 0 ? shippingCost : productBasedShippingCost).toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

