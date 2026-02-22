'use client';

import { useState, useEffect } from 'react';
import {
  useGetCouponSettingsQuery,
  useUpdateCouponSettingsMutation,
  useGetShippingSettingsQuery,
  useUpdateShippingSettingsMutation,
} from '@/redux/settings/settingsApi';
import type {
  CouponBehaviorSettings,
  ShippingSettings,
} from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import Wrapper from '@/layout/wrapper';

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState<CouponBehaviorSettings>({
    autoApply: false,
    autoApplyStrategy: 'best_savings',
    showToastOnApply: true,
  });
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    freeShippingThreshold: null,
  });

  const {
    data: couponData,
    isLoading: loadingCoupon,
    isSuccess: couponLoaded,
  } = useGetCouponSettingsQuery(undefined, { skip: false });
  const {
    data: shippingData,
    isLoading: loadingShipping,
    isSuccess: shippingLoaded,
  } = useGetShippingSettingsQuery(undefined, { skip: false });

  const [updateCoupon, { isLoading: savingCoupon }] =
    useUpdateCouponSettingsMutation();
  const [updateShipping, { isLoading: savingShipping }] =
    useUpdateShippingSettingsMutation();

  useEffect(() => {
    if (couponLoaded && couponData) {
      setSettings(couponData);
    }
  }, [couponLoaded, couponData]);

  useEffect(() => {
    if (shippingLoaded && shippingData) {
      setShippingSettings(shippingData);
    }
  }, [shippingLoaded, shippingData]);

  const loading = loadingCoupon || loadingShipping;

  const handleSaveCoupon = async () => {
    try {
      await updateCoupon(settings).unwrap();
      toast.success('Coupon settings saved');
    } catch (err) {
      toast.error(
        err && typeof err === 'object' && 'data' in err
          ? String(
              (err as { data?: { message?: string } }).data?.message ??
                'Failed to save'
            )
          : 'Failed to save'
      );
    }
  };

  const handleSaveShipping = async () => {
    try {
      await updateShipping(shippingSettings).unwrap();
      toast.success('Shipping settings saved');
    } catch (err) {
      toast.error(
        err && typeof err === 'object' && 'data' in err
          ? String(
              (err as { data?: { message?: string } }).data?.message ??
                'Failed to save'
            )
          : 'Failed to save'
      );
    }
  };

  if (loading) {
    return (
      <Wrapper>
        <div className="body-content px-8 py-8">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div>
              <h2 className="text-lg font-semibold">Settings</h2>
              <p className="text-muted-foreground text-sm">
                Coupon behavior and shipping configuration
              </p>
            </div>
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="body-content px-8 py-8">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div>
            <h2 className="text-lg font-semibold">Settings</h2>
            <p className="text-muted-foreground text-sm">
              Coupon behavior and shipping configuration
            </p>
          </div>

          <div className="space-y-8">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 text-base font-semibold">Coupon behavior</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Control how coupons are applied on the storefront.
              </p>

              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label htmlFor="autoApply">Auto-apply best coupon</Label>
                    <p className="text-muted-foreground text-xs">
                      When enabled, automatically applies the best qualifying
                      coupon when items are added to cart or at checkout.
                    </p>
                  </div>
                  <Switch
                    id="autoApply"
                    checked={settings.autoApply}
                    onCheckedChange={checked =>
                      setSettings(s => ({ ...s, autoApply: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="autoApplyStrategy">
                    When multiple coupons apply
                  </Label>
                  <Select
                    value={settings.autoApplyStrategy}
                    onValueChange={v =>
                      setSettings(s => ({
                        ...s,
                        autoApplyStrategy:
                          v as CouponBehaviorSettings['autoApplyStrategy'],
                      }))
                    }
                  >
                    <SelectTrigger id="autoApplyStrategy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="best_savings">
                        Best savings
                      </SelectItem>
                      <SelectItem value="first_created">
                        First created
                      </SelectItem>
                      <SelectItem value="highest_percentage">
                        Highest percentage
                      </SelectItem>
                      <SelectItem value="customer_choice">
                        Customer choice (no auto-apply)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-xs">
                    Best savings = highest discount amount. Customer choice
                    disables auto-apply.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label htmlFor="showToastOnApply">
                      Show toast when applied
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Display a notification when a coupon is auto-applied.
                    </p>
                  </div>
                  <Switch
                    id="showToastOnApply"
                    checked={settings.showToastOnApply}
                    onCheckedChange={checked =>
                      setSettings(s => ({ ...s, showToastOnApply: checked }))
                    }
                  />
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={handleSaveCoupon} disabled={savingCoupon}>
                  {savingCoupon ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 text-base font-semibold">Shipping</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Free shipping threshold. When order subtotal meets this amount,
                shipping is free.
              </p>

              <div className="space-y-2">
                <Label htmlFor="freeShippingThreshold">
                  Free shipping threshold
                </Label>
                <Input
                  id="freeShippingThreshold"
                  type="number"
                  min={0}
                  step={1}
                  className="max-w-xs"
                  placeholder="Leave empty to disable"
                  value={shippingSettings.freeShippingThreshold ?? ''}
                  onChange={e =>
                    setShippingSettings(s => ({
                      ...s,
                      freeShippingThreshold: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    }))
                  }
                />
                <p className="text-muted-foreground text-xs">
                  Leave empty to disable. Subtotal must meet this amount for free
                  shipping.
                </p>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleSaveShipping}
                  disabled={savingShipping}
                >
                  {savingShipping ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
