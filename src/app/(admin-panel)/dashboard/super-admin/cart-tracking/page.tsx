'use client';

import Wrapper from '@/layout/wrapper';
import {
  useGetCartTrackingEventsQuery,
  useGetCartTrackingStatsQuery,
} from '@/redux/cart-tracking/cartTrackingApi';
import { useState } from 'react';

export default function CartTrackingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  // Fetch cart tracking events
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
  } = useGetCartTrackingEventsQuery({
    page: currentPage,
    limit: limit,
  });

  // Fetch basic stats
  const { data: statsData, isLoading: statsLoading } =
    useGetCartTrackingStatsQuery();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'add_to_cart':
        return 'bg-blue-100 text-blue-800';
      case 'cart_viewed':
        return 'bg-green-100 text-green-800';
      case 'checkout_started':
        return 'bg-yellow-100 text-yellow-800';
      case 'purchase_completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'product-page':
        return 'bg-indigo-100 text-indigo-800';
      case 'shop-page':
        return 'bg-pink-100 text-pink-800';
      case 'search-results':
        return 'bg-orange-100 text-orange-800';
      case 'category-page':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-end flex-wrap mb-8">
          <div className="page-title">
            <h3 className="mb-0 text-4xl font-bold text-gray-900">
              Cart Tracking Analytics
            </h3>
            <p className="text-gray-600 m-0">
              Monitor and analyze cart behavior and conversions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {!statsLoading && statsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Today&apos;s Events
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsData.todayEvents || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Weekly Events
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsData.weekEvents || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Cart Value
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(statsData.averageCartValue || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Events
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsData.totalEvents || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Tracking Events Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Cart Tracking Events
            </h3>
            <p className="text-sm text-gray-600">
              Recent cart tracking activities and user interactions
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              {eventsLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-3">
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index}
                        className="h-12 bg-gray-200 rounded"
                      ></div>
                    ))}
                  </div>
                </div>
              ) : eventsError ? (
                <div className="p-6 text-center">
                  <div className="text-red-600 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <p className="text-red-600 font-medium">
                    Error loading cart tracking data
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(eventsError as any)?.data?.message ||
                      'Please check your connection and try again'}
                  </p>
                </div>
              ) : eventsData?.events && eventsData.events.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event Type
                      </th>
                      <th className="w-80 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Details
                      </th>
                      <th className="w-40 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session ID
                      </th>
                      <th className="w-40 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {eventsData.events.map((event: any) => (
                      <tr
                        key={event._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(
                              event.eventType
                            )}`}
                          >
                            {event.eventType?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 break-words">
                              <span
                                className="cursor-help"
                                title={
                                  event.productId?.title ||
                                  event.productTitle ||
                                  'Unknown Product'
                                }
                              >
                                {event.productId?.title ||
                                  event.productTitle ||
                                  'Unknown Product'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 break-all">
                              <span className="font-medium">SKU:</span>{' '}
                              <span
                                className="cursor-help"
                                title={
                                  event.productId?.sku ||
                                  event.productSku ||
                                  'N/A'
                                }
                              >
                                {event.productId?.sku ||
                                  event.productSku ||
                                  'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 break-words">
                            <span
                              className="cursor-help"
                              title={
                                event.productId?.category?.name ||
                                event.productCategory ||
                                'N/A'
                              }
                            >
                              {event.productId?.category?.name ||
                                event.productCategory ||
                                'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceColor(
                              event.source
                            )}`}
                            title={event.source || 'Unknown'}
                          >
                            {event.source || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            ${(event.finalPrice || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div
                            className="text-xs text-gray-500 font-mono break-all cursor-help"
                            title={event.sessionId || 'N/A'}
                          >
                            {event.sessionId?.substring(0, 8) || 'N/A'}
                            {event.sessionId &&
                              event.sessionId.length > 8 &&
                              '...'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 break-words">
                            {formatDate(event.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">
                    No cart tracking data found
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Cart tracking events will appear here once users start
                    interacting with products
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {eventsData && eventsData.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * limit + 1} to{' '}
                {Math.min(currentPage * limit, eventsData.total)} of{' '}
                {eventsData.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-md">
                  Page {currentPage} of {eventsData.totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(prev =>
                      Math.min(prev + 1, eventsData.totalPages)
                    )
                  }
                  disabled={currentPage === eventsData.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
