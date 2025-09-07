'use client';
import React, { useState } from 'react';
import { useGetOverallAnalyticsQuery, useGetCouponAnalyticsQuery } from '@/redux/coupon/couponApi';
import { ICoupon } from '@/types/coupon';

interface IProps {
  coupons: ICoupon[];
}

export default function CouponAnalyticsDashboard({ coupons }: IProps) {
  const [selectedCouponId, setSelectedCouponId] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const { data: overallAnalytics, isLoading: overallLoading } = useGetOverallAnalyticsQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const { data: couponAnalytics, isLoading: couponLoading } = useGetCouponAnalyticsQuery(
    {
      id: selectedCouponId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    { skip: !selectedCouponId }
  );

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (overallLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const analytics = overallAnalytics?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Coupon Analytics</h2>
            <p className="text-gray-600 mt-1">Track coupon performance and usage statistics</p>
          </div>
          
          {/* Date Range Filters */}
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overall Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Coupons</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalCoupons || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Coupons</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.activeCoupons || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalUsage || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Discount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics?.totalDiscount || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue Generated</span>
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(analytics?.totalRevenue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Discount %</span>
              <span className="text-lg font-semibold text-blue-600">
                {formatPercentage(analytics?.avgDiscountPercentage || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Discount to Revenue Ratio</span>
              <span className="text-lg font-semibold text-purple-600">
                {analytics?.totalRevenue 
                  ? formatPercentage((analytics.totalDiscount / analytics.totalRevenue) * 100)
                  : '0%'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Coupons</h3>
          <div className="space-y-3">
            {coupons
              ?.sort((a, b) => b.analytics.totalUsage - a.analytics.totalUsage)
              ?.slice(0, 5)
              ?.map((coupon) => (
                <div key={coupon._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{coupon.couponCode}</p>
                    <p className="text-sm text-gray-600">{coupon.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{coupon.analytics.totalUsage} uses</p>
                    <p className="text-sm text-green-600">
                      {formatCurrency(coupon.analytics.totalDiscount)} saved
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Individual Coupon Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Individual Coupon Analytics</h3>
          <div className="mt-4 lg:mt-0">
            <select
              value={selectedCouponId}
              onChange={(e) => setSelectedCouponId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a coupon</option>
              {coupons?.map((coupon) => (
                <option key={coupon._id} value={coupon._id}>
                  {coupon.couponCode} - {coupon.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedCouponId && couponAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Usage</p>
              <p className="text-2xl font-bold text-blue-600">
                {couponAnalytics.data.analytics.totalUsage}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Discount</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(couponAnalytics.data.analytics.totalDiscount)}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Revenue Generated</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(couponAnalytics.data.analytics.totalRevenue)}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Unique Users</p>
              <p className="text-2xl font-bold text-orange-600">
                {couponAnalytics.data.analytics.uniqueUsers}
              </p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
              <p className="text-2xl font-bold text-indigo-600">
                {formatCurrency(couponAnalytics.data.analytics.avgOrderValue)}
              </p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Avg Discount</p>
              <p className="text-2xl font-bold text-pink-600">
                {formatCurrency(couponAnalytics.data.analytics.avgDiscount)}
              </p>
            </div>
          </div>
        )}

        {selectedCouponId && !couponAnalytics && couponLoading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {selectedCouponId && !couponAnalytics && !couponLoading && (
          <div className="text-center py-8 text-gray-500">
            No analytics data available for this coupon.
          </div>
        )}
      </div>
    </div>
  );
} 