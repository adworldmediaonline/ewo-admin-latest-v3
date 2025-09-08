'use client';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { Calendar, DollarSign, Package, ShoppingCart } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGetDashboardAmountQuery } from '@/redux/order/orderApi';

function ErrorMsg({ msg }: { msg: string }) {
  return <div className="text-red-500 text-center p-4">{msg}</div>;
}

export function SectionCards() {
  const {
    data: dashboardOrderAmount,
    isError,
    isLoading,
  } = useGetDashboardAmountQuery();

  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isLoading && isError) {
    return <ErrorMsg msg="There was an error loading dashboard data" />;
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Today Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${dashboardOrderAmount?.todayOrderAmount?.toFixed(2) || '0.00'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Today
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Cash: $
            {dashboardOrderAmount?.todayCashPaymentAmount?.toFixed(2) || '0.00'}{' '}
            | Card: $
            {dashboardOrderAmount?.todayCardPaymentAmount?.toFixed(2) || '0.00'}
          </div>
          <div className="text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <DollarSign className="size-4" />
              Today's order summary
            </span>
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Yesterday Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${dashboardOrderAmount?.yesterdayOrderAmount?.toFixed(2) || '0.00'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              Yesterday
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Cash: $
            {dashboardOrderAmount?.yesterDayCashPaymentAmount?.toFixed(2) ||
              '0.00'}{' '}
            | Card: $
            {dashboardOrderAmount?.yesterDayCardPaymentAmount?.toFixed(2) ||
              '0.00'}
          </div>
          <div className="text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShoppingCart className="size-4" />
              Yesterday's order summary
            </span>
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Monthly Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${dashboardOrderAmount?.monthlyOrderAmount?.toFixed(2) || '0.00'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              This Month
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Monthly revenue <Calendar className="size-4" />
          </div>
          <div className="text-muted-foreground">Current month performance</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${dashboardOrderAmount?.totalOrderAmount?.toFixed(2) || '0.00'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              All Time
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total revenue <Package className="size-4" />
          </div>
          <div className="text-muted-foreground">Complete order history</div>
        </CardFooter>
      </Card>
    </div>
  );
}
