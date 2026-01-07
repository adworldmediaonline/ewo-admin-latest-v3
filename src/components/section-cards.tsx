'use client';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { Calendar, Package } from 'lucide-react';

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
import { Skeleton } from '@/components/ui/skeleton';

function ErrorMsg({ msg }: { msg: string }) {
  return <div className="text-red-500 text-center p-4">{msg}</div>;
}

// Skeleton loading component for better UX
function CardSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>
          <Skeleton className="h-4 w-24" />
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          <Skeleton className="h-8 w-32" />
        </CardTitle>
        <CardAction>
          <Skeleton className="h-6 w-20" />
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-32" />
      </CardFooter>
    </Card>
  );
}

export function SectionCards() {
  const {
    data: dashboardOrderAmount,
    isError,
    isLoading,
    isFetching,
  } = useGetDashboardAmountQuery();

  // Show skeleton only while loading
  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError) {
    return <ErrorMsg msg="There was an error loading dashboard data" />;
  }

  // Use actual data from API
  const displayData = dashboardOrderAmount || {
    todayOrderAmount: 0,
    yesterdayOrderAmount: 0,
    monthlyOrderAmount: 0,
    totalOrderAmount: 0,
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Today Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${displayData.todayOrderAmount?.toFixed(2) || '0.00'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Today
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {/* <div className="line-clamp-1 flex gap-2 font-medium">
            Card: $
            {displayData?.todayCardPaymentAmount?.toFixed(2) || '0.00'}
          </div> */}
          {/* <div className="text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <DollarSign className="size-4" />
              Today's order summary
            </span>
          </div> */}
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Yesterday Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${displayData.yesterdayOrderAmount?.toFixed(2) || '0.00'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              Yesterday
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {/* <div className="line-clamp-1 flex gap-2 font-medium">
            Card: $
            {displayData?.yesterDayCardPaymentAmount?.toFixed(2) || '0.00'}
          </div> */}
          {/* <div className="text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShoppingCart className="size-4" />
              Yesterday's order summary
            </span>
          </div> */}
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Monthly Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${displayData.monthlyOrderAmount?.toFixed(2) || '0.00'}
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
            ${displayData.totalOrderAmount?.toFixed(2) || '0.00'}
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
