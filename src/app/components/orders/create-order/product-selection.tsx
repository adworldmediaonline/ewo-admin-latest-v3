'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useGetAllProductsQuery } from '@/redux/product/productApi';
import { IProduct } from '@/types/product';
import { Minus, Plus, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import ProductConfigDialog from './product-config-dialog';

interface CartItem extends IProduct {
  orderQuantity: number;
  selectedOption?: any;
  selectedConfigurations?: any;
  basePrice?: number;
  productConfigurations?: any;
  customPrice?: number;
}

interface ProductSelectionProps {
  cartItems: CartItem[];
  onAddProduct: (product: IProduct & {
    selectedOption?: any;
    selectedConfigurations?: any;
    finalPriceDiscount?: number;
    basePrice?: number;
    productConfigurations?: any;
    customPrice?: number;
  }) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdatePrice?: (productId: string, price: number) => void;
  onRemoveProduct: (productId: string) => void;
}

export default function ProductSelection({
  cartItems,
  onAddProduct,
  onUpdateQuantity,
  onUpdatePrice,
  onRemoveProduct,
}: ProductSelectionProps) {
  const { data: products, isLoading } = useGetAllProductsQuery();
  const [searchValue, setSearchValue] = useState('');
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [customPrices, setCustomPrices] = useState<Record<string, string>>({});

  const filteredProducts = useMemo(() => {
    if (!products?.data) return [];

    let filtered = [...products.data];

    if (searchValue) {
      const searchTerm = searchValue.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.title?.toLowerCase().includes(searchTerm) ||
          p.sku?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [products?.data, searchValue]);

  const hasOptionsOrConfigurations = (product: IProduct) => {
    const hasOptions = product.options && product.options.length > 0;
    const hasConfigurations =
      product.productConfigurations &&
      product.productConfigurations.length > 0 &&
      product.productConfigurations.some(
        config => config.options && config.options.length > 0
      );
    return hasOptions || hasConfigurations;
  };

  const handleAddToCart = (product: IProduct) => {
    const customPrice = customPrices[product._id];
    const priceToUse = customPrice ? parseFloat(customPrice) : undefined;

    if (hasOptionsOrConfigurations(product)) {
      setSelectedProduct(product);
      setConfigDialogOpen(true);
    } else {
      onAddProduct({
        ...product,
        customPrice: priceToUse,
        finalPriceDiscount: priceToUse || product.finalPriceDiscount || product.price,
      });
      // Clear custom price after adding
      setCustomPrices(prev => {
        const newPrices = { ...prev };
        delete newPrices[product._id];
        return newPrices;
      });
    }
  };

  const handleConfigConfirm = (configuredProduct: IProduct & {
    selectedOption?: any;
    selectedConfigurations?: any;
    finalPriceDiscount?: number;
    basePrice?: number;
    productConfigurations?: any;
  }) => {
    const customPrice = customPrices[configuredProduct._id];
    const priceToUse = customPrice ? parseFloat(customPrice) : undefined;

    onAddProduct({
      ...configuredProduct,
      customPrice: priceToUse,
      finalPriceDiscount: priceToUse || configuredProduct.finalPriceDiscount || configuredProduct.price,
    });

    // Clear custom price after adding
    setCustomPrices(prev => {
      const newPrices = { ...prev };
      delete newPrices[configuredProduct._id];
      return newPrices;
    });

    setConfigDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleQuantityChange = (productId: string, change: number) => {
    const item = cartItems.find(item => item._id === productId);
    if (item) {
      const newQuantity = Math.max(1, item.orderQuantity + change);
      onUpdateQuantity(productId, newQuantity);
    }
  };

  const isProductInCart = (productId: string) => {
    return cartItems.some(item => item._id === productId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products by name or SKU..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading products...
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <ScrollArea className="h-[400px] w-full">
            <div className="min-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right w-32">Custom Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right w-32">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map(product => {
                    const inCart = isProductInCart(product._id);
                    const cartItem = cartItems.find(item => item._id === product._id);

                    return (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                            {product.imageURLs?.[0] ? (
                              <Image
                                src={product.imageURLs[0]}
                                alt={product.title || 'Product'}
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
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{product.title}</div>
                          {product.category?.name && (
                            <div className="text-sm text-muted-foreground">
                              {product.category.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.sku}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number(product.finalPriceDiscount || product.price || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {inCart && cartItem?.customPrice !== undefined ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={cartItem.customPrice}
                                onChange={e => {
                                  const newPrice = parseFloat(e.target.value) || 0;
                                  if (onUpdatePrice) {
                                    onUpdatePrice(product._id, newPrice);
                                  }
                                }}
                                className="h-8 w-20 text-sm"
                                placeholder="0.00"
                              />
                            </div>
                          ) : (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={customPrices[product._id] || ''}
                              onChange={e => {
                                setCustomPrices(prev => ({
                                  ...prev,
                                  [product._id]: e.target.value,
                                }));
                              }}
                              className="h-8 w-20 text-sm"
                              placeholder="Custom"
                              disabled={inCart}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              (product.quantity || 0) > 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {product.quantity || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {inCart ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(product._id, -1)}
                                disabled={cartItem?.orderQuantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {cartItem?.orderQuantity || 1}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(product._id, 1)}
                                disabled={
                                  cartItem
                                    ? cartItem.orderQuantity >= (product.quantity || 0)
                                    : false
                                }
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveProduct(product._id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                              disabled={(product.quantity || 0) === 0}
                            >
                              {hasOptionsOrConfigurations(product) ? 'Configure' : 'Add'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      )}

      {/* Product Configuration Dialog */}
      {selectedProduct && (
        <ProductConfigDialog
          product={selectedProduct}
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          onConfirm={handleConfigConfirm}
        />
      )}
    </div>
  );
}

