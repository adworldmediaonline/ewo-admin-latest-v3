'use client';
import { useGetAllCouponsQuery } from '@/redux/coupon/couponApi';
import React from 'react';
import CouponAnalyticsDashboard from './coupon-analytics-dashboard';
import CouponListArea from './coupon-list-area';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function EnhancedCouponArea() {
  const { data: coupons = [], isLoading, isError } = useGetAllCouponsQuery();

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-8 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state if there's an error
  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load coupons</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <Tabs defaultValue="management" className="w-full">
          <div className="border-b px-6 pt-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="management">Coupon Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="management" className="mt-0">
            <CouponListArea />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <div className="p-6">
              <CouponAnalyticsDashboard coupons={coupons} />
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
