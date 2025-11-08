'use client';

import {
  IconTrendingDown,
  IconTrendingUp,
  IconCheck,
  IconClock,
  IconTruck,
  IconX,
  IconPackage,
} from '@tabler/icons-react';
import * as React from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useGetOrderBreakdownQuery } from '@/redux/order/orderApi';

const chartConfig = {
  delivered: {
    label: 'Delivered',
    color: 'hsl(142, 76%, 36%)',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(43, 96%, 56%)',
  },
  processing: {
    label: 'Processing',
    color: 'hsl(217, 91%, 60%)',
  },
  shipped: {
    label: 'Shipped',
    color: 'hsl(262, 83%, 58%)',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'hsl(0, 84%, 60%)',
  },
} satisfies ChartConfig;

const statusColors = {
  delivered: '#16a34a',
  pending: '#eab308',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  cancelled: '#ef4444',
};

const statusIcons = {
  delivered: IconCheck,
  pending: IconClock,
  processing: IconPackage,
  shipped: IconTruck,
  cancelled: IconX,
};

const CustomPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="font-bold text-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function OrderBreakdown() {
  const { data: breakdownData, isLoading, isError } = useGetOrderBreakdownQuery();

  if (isLoading) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle>Order Breakdown</CardTitle>
            <CardDescription>Loading order breakdown data...</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <div className="flex items-center justify-center h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !breakdownData?.data) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle>Order Breakdown</CardTitle>
            <CardDescription>Failed to load order breakdown data</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-muted-foreground">Unable to load breakdown data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { delivered, pending, processing, shipped, cancelled, total } = breakdownData.data;

  // Prepare data for charts
  const pieData = [
    { name: 'Delivered', value: delivered.count, color: statusColors.delivered },
    { name: 'Pending', value: pending.count, color: statusColors.pending },
    { name: 'Processing', value: processing.count, color: statusColors.processing },
    { name: 'Shipped', value: shipped.count, color: statusColors.shipped },
    { name: 'Cancelled', value: cancelled.count, color: statusColors.cancelled },
  ].filter(item => item.value > 0);

  const statusCards = [
    {
      status: 'delivered',
      label: 'Delivered',
      data: delivered,
      icon: statusIcons.delivered,
      color: statusColors.delivered,
      trend: 'up',
    },
    {
      status: 'pending',
      label: 'Pending',
      data: pending,
      icon: statusIcons.pending,
      color: statusColors.pending,
      trend: 'neutral',
    },
    {
      status: 'shipped',
      label: 'Shipped',
      data: shipped,
      icon: statusIcons.shipped,
      color: statusColors.shipped,
      trend: 'up',
    },
    {
      status: 'cancelled',
      label: 'Cancelled',
      data: cancelled,
      icon: statusIcons.cancelled,
      color: statusColors.cancelled,
      trend: 'down',
    },
  ];

  return (
    <div className="px-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconPackage className="w-6 h-6" />
            Order Breakdown
          </CardTitle>
          <CardDescription>
            Comprehensive overview of order statuses and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {/* Status Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statusCards.map(({ status, label, data, icon: Icon, color, trend }) => (
              <Card
                key={status}
                className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4"
                style={{ borderLeftColor: color }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {label}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold tabular-nums">
                          {data.count}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          ({data.percentage}%)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${data.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div
                      className="rounded-full p-2"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                  </div>
                  {trend === 'up' && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                      <IconTrendingUp className="w-3 h-3" />
                      <span>Good performance</span>
                    </div>
                  )}
                  {trend === 'down' && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                      <IconTrendingDown className="w-3 h-3" />
                      <span>Needs attention</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Total Orders
                    </p>
                    <h3 className="text-3xl font-bold">{total.orders}</h3>
                  </div>
                  <div className="rounded-full p-4 bg-primary/10">
                    <IconPackage className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Total Revenue
                    </p>
                    <h3 className="text-3xl font-bold">${total.revenue.toFixed(2)}</h3>
                  </div>
                  <div className="rounded-full p-4 bg-green-500/10">
                    <IconTrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Distribution</CardTitle>
              <CardDescription>
                Visual breakdown of orders by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={CustomPieLabel}
                      outerRadius={140}
                      innerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-xl">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: data.payload.color }}
                                />
                                <span className="font-semibold">{data.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Orders: <span className="font-medium text-foreground">{data.value}</span>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Percentage: <span className="font-medium text-foreground">
                                  {((data.value as number / total.orders) * 100).toFixed(1)}%
                                </span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      content={({ payload }) => {
                        return (
                          <div className="flex flex-wrap justify-center gap-4 mt-4">
                            {payload?.map((entry, index) => (
                              <div
                                key={`legend-${index}`}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {entry.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

