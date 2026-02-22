export interface CouponBehaviorSettings {
  autoApply: boolean;
  autoApplyStrategy:
    | 'best_savings'
    | 'first_created'
    | 'highest_percentage'
    | 'customer_choice';
  showToastOnApply: boolean;
}

export interface ShippingSettings {
  freeShippingThreshold: number | null;
}
