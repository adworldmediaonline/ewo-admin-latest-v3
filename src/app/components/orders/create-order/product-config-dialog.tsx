'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { IProduct } from '@/types/product';

interface ProductConfigDialogProps {
  product: IProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (product: IProduct & {
    selectedOption?: any;
    selectedConfigurations?: any;
    finalPriceDiscount?: number;
    basePrice?: number;
    productConfigurations?: any;
  }) => void;
}

export default function ProductConfigDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
}: ProductConfigDialogProps) {
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [selectedConfigurations, setSelectedConfigurations] = useState<{
    [configIndex: number]: {
      optionIndex: number;
      option: { name: string; price: number | string };
    };
  }>(() => {
    // Initialize with preselected options from backend
    const initial: {
      [configIndex: number]: {
        optionIndex: number;
        option: { name: string; price: number | string };
      };
    } = {};
    if (product.productConfigurations && product.productConfigurations.length > 0) {
      product.productConfigurations.forEach((config, configIndex) => {
        if (config.options && config.options.length > 0) {
          const preselectedIndex = config.options.findIndex(
            opt => opt.isSelected
          );
          if (preselectedIndex !== -1) {
            initial[configIndex] = {
              optionIndex: preselectedIndex,
              option: {
                name: config.options[preselectedIndex].name,
                price: config.options[preselectedIndex].price,
              },
            };
          }
        }
      });
    }
    return initial;
  });

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      // Reset to default selections when dialog closes
      const initial: {
        [configIndex: number]: {
          optionIndex: number;
          option: { name: string; price: number | string };
        };
      } = {};
      if (product.productConfigurations && product.productConfigurations.length > 0) {
        product.productConfigurations.forEach((config, configIndex) => {
          if (config.options && config.options.length > 0) {
            const preselectedIndex = config.options.findIndex(
              opt => opt.isSelected
            );
            if (preselectedIndex !== -1) {
              initial[configIndex] = {
                optionIndex: preselectedIndex,
                option: {
                  name: config.options[preselectedIndex].name,
                  price: config.options[preselectedIndex].price,
                },
              };
            }
          }
        });
      }
      setSelectedConfigurations(initial);
      setSelectedOption(null);
    }
  }, [open, product.productConfigurations]);

  // Handle configuration change
  const handleConfigurationChange = useCallback(
    (
      configIndex: number,
      optionIndex: number,
      option: { name: string; price: number | string }
    ) => {
      setSelectedConfigurations(prev => ({
        ...prev,
        [configIndex]: {
          optionIndex,
          option,
        },
      }));
    },
    []
  );

  // Get sum of all selected configuration option prices
  const getSelectedConfigurationPrice = useCallback(() => {
    if (!product.productConfigurations || product.productConfigurations.length === 0) {
      return null;
    }

    const selectedConfigEntries = Object.values(selectedConfigurations);
    if (selectedConfigEntries.length === 0) {
      return null;
    }

    // Sum all selected option prices
    let totalConfigPrice = 0;
    let hasAnyPrice = false;

    for (const { option } of selectedConfigEntries) {
      if (option && option.price !== undefined && option.price !== null) {
        const configPrice = Number(option.price);
        if (configPrice > 0) {
          totalConfigPrice += configPrice;
          hasAnyPrice = true;
        }
      }
    }

    return hasAnyPrice ? totalConfigPrice : null;
  }, [product.productConfigurations, selectedConfigurations]);

  // Calculate final price
  const calculateFinalPrice = useCallback(() => {
    const configPrice = getSelectedConfigurationPrice();
    if (configPrice !== null) {
      const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
      return configPrice + optionPrice;
    }

    const baseFinalPrice = product.finalPriceDiscount || product.price || 0;
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    return Number(baseFinalPrice) + optionPrice;
  }, [getSelectedConfigurationPrice, selectedOption, product.finalPriceDiscount, product.price]);

  const finalPrice = useMemo(() => calculateFinalPrice(), [calculateFinalPrice]);

  // Handle confirm
  const handleConfirm = () => {
    const originalProductPrice = Number(product.price || 0);
    const markedUpPrice = product.updatedPrice || originalProductPrice;

    // Step 1: Determine base price - sum all selected configuration option prices
    let basePrice = originalProductPrice;

    if (
      product.productConfigurations &&
      product.productConfigurations.length > 0 &&
      Object.keys(selectedConfigurations).length > 0
    ) {
      const configPrice = getSelectedConfigurationPrice();
      if (configPrice !== null && configPrice > 0) {
        // Use sum of all configuration option prices as base
        basePrice = configPrice;
      } else {
        // If configurations exist but none have prices, use original price
        basePrice = Number(product.finalPriceDiscount || originalProductPrice);
      }
    } else {
      // No configurations - use finalPriceDiscount if available, otherwise original price
      basePrice = Number(product.finalPriceDiscount || originalProductPrice);
    }

    // Step 2: Add product option price (from product.options, not configurations)
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalSellingPrice = basePrice + optionPrice;

    // Create properly formatted productConfigurations array with correct isSelected flags
    let updatedProductConfigurations = undefined;
    if (
      product.productConfigurations &&
      product.productConfigurations.length > 0 &&
      Object.keys(selectedConfigurations).length > 0
    ) {
      updatedProductConfigurations = product.productConfigurations.map((config, configIndex) => {
        const selectedConfig = selectedConfigurations[configIndex];

        // If this configuration has a user selection, update isSelected flags
        if (selectedConfig) {
          return {
            ...config,
            options: config.options.map((option, optionIndex) => ({
              ...option,
              // Set isSelected to true only for the user-selected option
              isSelected: optionIndex === selectedConfig.optionIndex,
            })),
          };
        }

        // If no user selection for this config, keep original (preselected) state
        return config;
      });
    }

    onConfirm({
      ...product,
      finalPriceDiscount: finalSellingPrice,
      updatedPrice: markedUpPrice,
      selectedOption,
      basePrice: basePrice,
      productConfigurations: updatedProductConfigurations || product.productConfigurations,
      selectedConfigurations: Object.keys(selectedConfigurations).length > 0
        ? selectedConfigurations
        : undefined,
    });

    onOpenChange(false);
  };

  const hasOptions = product.options && product.options.length > 0;
  const hasConfigurations =
    product.productConfigurations &&
    product.productConfigurations.length > 0 &&
    product.productConfigurations.some(
      config => config.options && config.options.length > 0
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-lg sm:text-xl line-clamp-2">
            Configure Product: {product.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 w-full">
          <div className="px-6 pt-4 pb-8 space-y-6">
            {/* Product Options */}
            {hasOptions && (
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm sm:text-base font-semibold">Options</Label>
                <Select
                  value={
                    selectedOption
                      ? product.options!.indexOf(selectedOption).toString()
                      : undefined
                  }
                  onValueChange={value => {
                    setSelectedOption(product.options![parseInt(value)]);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an option..." />
                  </SelectTrigger>
                  <SelectContent>
                    {product.options!.map((option, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {option.title}
                        {option.price && Number(option.price) !== 0
                          ? ` (+$${Number(option.price).toFixed(2)})`
                          : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Product Configurations */}
            {hasConfigurations && (
              <div className="space-y-4 sm:space-y-6">
                <Label className="text-sm sm:text-base font-semibold">Configurations</Label>
                {product.productConfigurations!.map((config, configIndex) => {
                  if (!config.options || config.options.length === 0) {
                    return null;
                  }

                  const selectedConfig = selectedConfigurations[configIndex];
                  const selectedIndex = selectedConfig?.optionIndex ?? -1;

                  return (
                    <div key={configIndex} className="space-y-2 sm:space-y-3">
                      <h3 className="text-xs sm:text-sm font-medium text-foreground">
                        {config.title}
                      </h3>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {config.options.map((option, optionIndex) => {
                          const isSelected = selectedIndex === optionIndex;
                          const hasPrice = option.price && Number(option.price) > 0;

                          return (
                            <button
                              key={optionIndex}
                              type="button"
                              onClick={() =>
                                handleConfigurationChange(configIndex, optionIndex, {
                                  name: option.name,
                                  price: option.price,
                                })
                              }
                              className={cn(
                                'relative px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border-2 transition-all duration-200 text-left w-full',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                                'active:scale-[0.98]',
                                isSelected
                                  ? 'border-primary bg-primary/5 font-semibold'
                                  : 'border-muted-foreground/30 bg-background hover:border-muted-foreground/50 hover:bg-muted/30'
                              )}
                              aria-pressed={isSelected}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={cn(
                                    'text-sm font-medium',
                                    isSelected
                                      ? 'text-foreground'
                                      : 'text-foreground/90'
                                  )}
                                >
                                  {option.name}
                                </span>
                                {hasPrice && (
                                  <span
                                    className={cn(
                                      'text-xs font-medium whitespace-nowrap',
                                      isSelected
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                    )}
                                  >
                                    ${Number(option.price).toFixed(2)}
                                  </span>
                                )}
                              </div>

                              {/* Selection Indicator */}
                              {isSelected && (
                                <div className="absolute top-2 right-2">
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Price Display */}
            <Separator className="my-4" />
            <div className="space-y-2 pb-4">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Base Price</span>
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                  ${Number(product.finalPriceDiscount || product.price || 0).toFixed(2)}
                </span>
              </div>
              {selectedOption && Number(selectedOption.price) > 0 && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground truncate">
                    Option: {selectedOption.title}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-green-600 whitespace-nowrap">
                    +${Number(selectedOption.price).toFixed(2)}
                  </span>
                </div>
              )}
              {Object.keys(selectedConfigurations).length > 0 && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Configuration Options
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-green-600 whitespace-nowrap">
                    +${(finalPrice - Number(product.finalPriceDiscount || product.price || 0) - (selectedOption ? Number(selectedOption.price) : 0)).toFixed(2)}
                  </span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm sm:text-base font-semibold">Final Price</span>
                <span className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                  ${finalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t shrink-0 gap-2 sm:gap-2 bg-background">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="w-full sm:w-auto"
          >
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

