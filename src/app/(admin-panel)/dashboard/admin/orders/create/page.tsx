'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateOrderMutation } from '@/redux/order/orderApi';
import { IProduct } from '@/types/product';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import ProductSelection from '@/app/components/orders/create-order/product-selection';
import CustomerForm from '@/app/components/orders/create-order/customer-form';
import OrderSummary from '@/app/components/orders/create-order/order-summary';

interface CartItem extends IProduct {
  orderQuantity: number;
  selectedOption?: any;
  selectedConfigurations?: any;
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

type Step = 'products' | 'customer' | 'summary';

export default function CreateOrderPage() {
  const router = useRouter();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

  const [step, setStep] = useState<Step>('products');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerData, setCustomerData] = useState<CustomerFormData | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(item.finalPriceDiscount || item.price || 0);
    return sum + price * item.orderQuantity;
  }, 0);

  // Check free shipping eligibility
  const isFreeShippingEligible = subtotal >= 500;
  const finalShippingCost = isFreeShippingEligible ? 0 : shippingCost;

  // Calculate total amount
  const totalAmount = Math.max(0, subtotal + finalShippingCost);

  const handleAddProduct = (product: IProduct) => {
    const existingItem = cartItems.find(item => item._id === product._id);
    if (existingItem) {
      handleUpdateQuantity(product._id, existingItem.orderQuantity + 1);
    } else {
      setCartItems([
        ...cartItems,
        {
          ...product,
          orderQuantity: 1,
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

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      // Prepare cart items in the format expected by backend
      const cart = cartItems.map(item => ({
        _id: item._id,
        title: item.title,
        sku: item.sku,
        img: item.imageURLs?.[0] || '',
        price: Number(item.finalPriceDiscount || item.price || 0),
        finalPriceDiscount: Number(item.finalPriceDiscount || item.price || 0),
        orderQuantity: item.orderQuantity,
        quantity: item.quantity || 0,
        selectedOption: item.selectedOption || null,
        selectedConfigurations: item.selectedConfigurations || undefined,
        productConfigurations: item.productConfigurations || undefined,
        basePrice: Number(item.finalPriceDiscount || item.price || 0),
        updatedPrice: Number(item.updatedPrice || item.price || 0),
        shipping: item.shipping || {},
      }));

      // Prepare order data matching backend structure
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
        discount: 0, // Admin can add discounts manually if needed
        totalAmount: totalAmount,

        // Payment
        paymentMethod: paymentMethod,
        shippingOption: 'calculated',

        // Guest order (admin created orders don't have user)
        isGuestOrder: true,

        // Payment info for admin orders (for Card payments, provide paymentInfo to avoid Stripe lookup)
        // Backend will use this paymentInfo if Stripe lookup fails
        ...(paymentMethod === 'Card' && {
          paymentInfo: {
            id: 'admin-card-order-' + Date.now(),
            status: 'succeeded',
            amount: totalAmount * 100,
            currency: 'usd',
            client_secret: null,
            legacyData: {
              adminCreated: true,
              reason: 'Admin created order - marked as paid',
            },
          },
        }),

        // Applied coupons (empty for admin orders, can be added later)
        appliedCoupons: [],
      };

      const result = await createOrder(orderData).unwrap();

      if (result.success) {
        toast.success('Order created successfully!');
        router.push(`/dashboard/admin/orders/${result.order._id}`);
      } else {
        toast.error(result.message || 'Failed to create order');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error?.data?.message || 'Failed to create order. Please try again.');
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
          className={`flex items-center gap-2 ${
            step === 'products' ? 'text-primary font-semibold' : 'text-muted-foreground'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'products'
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
          className={`flex items-center gap-2 ${
            step === 'customer' ? 'text-primary font-semibold' : 'text-muted-foreground'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'customer'
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
          className={`flex items-center gap-2 ${
            step === 'summary' ? 'text-primary font-semibold' : 'text-muted-foreground'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'summary'
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
                  onRemoveProduct={handleRemoveProduct}
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
              shippingCost={finalShippingCost}
              onShippingCostChange={setShippingCost}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onSubmit={handleCreateOrder}
              isSubmitting={isCreating}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {isFreeShippingEligible ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `$${shippingCost.toFixed(2)}`
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

