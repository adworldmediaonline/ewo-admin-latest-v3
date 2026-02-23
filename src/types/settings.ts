export interface CouponBehaviorSettings {
  autoApply: boolean;
  autoApplyStrategy:
    | 'best_savings'
    | 'first_created'
    | 'highest_percentage'
    | 'customer_choice';
  showToastOnApply: boolean;
}

export interface ShippingDiscountTier {
  minItems: number;
  discountPercent: number;
}

export interface ShippingSettings {
  freeShippingThreshold: number | null;
  shippingDiscountTiers?: ShippingDiscountTier[];
}
