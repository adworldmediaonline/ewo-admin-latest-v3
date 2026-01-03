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
import { ScrollArea } from '@/components/ui/scroll-area';
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
}

interface ProductSelectionProps {
  cartItems: CartItem[];
  onAddProduct: (product: IProduct & {
    selectedOption?: any;
    selectedConfigurations?: any;
    finalPriceDiscount?: number;
    basePrice?: number;
    productConfigurations?: any;
  }) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveProduct: (productId: string) => void;
}

export default function ProductSelection({
  cartItems,
  onAddProduct,
  onUpdateQuantity,
  onRemoveProduct,
}: ProductSelectionProps) {
  const { data: products, isLoading } = useGetAllProductsQuery();
  const [searchValue, setSearchValue] = useState('');
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

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
    if (hasOptionsOrConfigurations(product)) {
      setSelectedProduct(product);
      setConfigDialogOpen(true);
    } else {
      onAddProduct(product);
    }
  };

  const handleConfigConfirm = (configuredProduct: IProduct & {
    selectedOption?: any;
    selectedConfigurations?: any;
    finalPriceDiscount?: number;
    basePrice?: number;
    productConfigurations?: any;
  }) => {
    onAddProduct(configuredProduct);
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
        <div className="border rounded-lg overflow-hidden flex flex-col">
          <div className="border-b">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right w-32">Action</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>
          <ScrollArea className="h-[400px] w-full">
            <Table>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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

