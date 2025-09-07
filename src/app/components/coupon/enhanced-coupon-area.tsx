'use client';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';
import useCouponSubmit from '@/hooks/useCouponSubmit';
import { useGetAllCouponsQuery } from '@/redux/coupon/couponApi';
import { Search } from '@/svg';
import { hasPermission, UserRole } from '@/utils/rolePermissions';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import CouponAnalyticsDashboard from './coupon-analytics-dashboard';
import CouponOffcanvas from './coupon-offcanvas';
import CouponTable from './coupon-table';

export default function EnhancedCouponArea() {
  // Move all hooks to the top before any conditional logic
  const { user } = useSelector((state: any) => state.auth);

  const {
    handleCouponSubmit,
    errors,
    handleSubmit,
    isSubmitted,
    logo,
    openSidebar,
    register,
    setIsSubmitted,
    setLogo,
    setOpenSidebar,
    control,
  } = useCouponSubmit();

  const [searchValue, setSearchValue] = useState<string>('');
  const [selectValue, setSelectValue] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'management' | 'analytics'>(
    'management'
  );

  const { data: coupons, isLoading, isError } = useGetAllCouponsQuery();

  // Now perform the permission check after all hooks are called
  const userRole = user?.role as UserRole;

  // Check if user has permission to manage coupons
  if (!hasPermission(userRole, 'canManageCoupons')) {
    return <UnauthorizedAccess />;
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading coupons...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600">
            Failed to load coupons. Please try again.
          </p>
        </div>
      </div>
    );
  }

  // Handle search value
  const handleSearchValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Handle select value
  const handleSelectValue = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectValue(e.target.value);
  };

  return (
    <>
      {/* Admin Role Badge */}
      <div className="mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Admin Access:</span> You have full
                access to coupon management and analytics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-t-md shadow-xs">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8 py-4">
            <button
              onClick={() => setActiveTab('management')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'management'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Coupon Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics & Reports
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'management' ? (
        <div className="bg-white rounded-b-md shadow-xs py-4">
          <div className="overflow-scroll 2xl:overflow-visible">
            <div className="w-[1500px] xl:w-full">
              {/* Search and Filter Bar */}
              <div className="tp-search-box flex items-center justify-between px-8 py-8">
                <div className="search-input relative">
                  <input
                    className="input h-[44px] w-full pl-14"
                    type="text"
                    placeholder="Search by coupon name or code"
                    onChange={handleSearchValue}
                  />
                  <button className="absolute top-1/2 left-5 translate-y-[-50%] hover:text-theme">
                    <Search />
                  </button>
                </div>
                <div className="flex justify-end space-x-6">
                  <div className="search-select mr-3 flex items-center space-x-3">
                    <span className="text-tiny inline-block leading-none -translate-y-[2px]">
                      Status:
                    </span>
                    <select onChange={handleSelectValue}>
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="expired">Expired</option>
                      <option value="exhausted">Exhausted</option>
                    </select>
                  </div>
                  <div className="search-select mr-3 flex items-center space-x-3">
                    <span className="text-tiny inline-block leading-none -translate-y-[2px]">
                      Type:
                    </span>
                    <select>
                      <option value="">All Types</option>
                      <option value="percentage">Percentage</option>
                      <option value="fixed_amount">Fixed Amount</option>
                      <option value="buy_x_get_y">Buy X Get Y</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>
                  <div className="product-add-btn flex">
                    <button
                      onClick={() => setOpenSidebar(true)}
                      type="button"
                      className="tp-btn offcanvas-open-btn"
                    >
                      Add Coupon
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="px-8 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">
                          Total Coupons
                        </p>
                        <p className="text-xl font-bold text-blue-900">
                          {(coupons || []).length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">
                          Active
                        </p>
                        <p className="text-xl font-bold text-green-900">
                          {
                            (coupons || []).filter(c => c.status === 'active')
                              .length
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <svg
                          className="w-5 h-5 text-orange-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-orange-600">
                          Expiring Soon
                        </p>
                        <p className="text-xl font-bold text-orange-900">
                          {
                            (coupons || []).filter(c => {
                              const endDate = new Date(c.endTime);
                              const now = new Date();
                              const sevenDaysFromNow = new Date(
                                now.getTime() + 7 * 24 * 60 * 60 * 1000
                              );
                              return (
                                endDate > now && endDate <= sevenDaysFromNow
                              );
                            }).length
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <svg
                          className="w-5 h-5 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">
                          Total Usage
                        </p>
                        <p className="text-xl font-bold text-purple-900">
                          {(coupons || []).reduce(
                            (sum, c) => sum + (c.usageCount || 0),
                            0
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Table */}
              <CouponTable
                setOpenSidebar={setOpenSidebar}
                searchValue={searchValue}
                selectValue={selectValue}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-b-md py-6">
          <div className="px-8">
            <CouponAnalyticsDashboard coupons={coupons || []} />
          </div>
        </div>
      )}

      {/* Coupon Offcanvas */}
      <CouponOffcanvas
        propsItems={{
          openSidebar,
          setOpenSidebar,
          setLogo,
          logo,
          handleCouponSubmit,
          handleSubmit,
          register,
          errors,
          isSubmitted,
          setIsSubmitted,
          control,
        }}
      />
    </>
  );
}
