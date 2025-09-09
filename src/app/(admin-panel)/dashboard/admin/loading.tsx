import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Dashboard Cards Section */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {/* Card 1 - Today Orders */}
        <div className="bg-card rounded-lg border p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-1 mt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <div className="mt-4 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>

        {/* Card 2 - Yesterday Orders */}
        <div className="bg-card rounded-lg border p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-28" />
              <div className="flex items-center gap-1 mt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <div className="mt-4 space-y-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>

        {/* Card 3 - Monthly Orders */}
        <div className="bg-card rounded-lg border p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <div className="mt-4 space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>

        {/* Card 4 - Total Orders */}
        <div className="bg-card rounded-lg border p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <div className="mt-4 space-y-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="px-4 lg:px-6">
        <div className="bg-card rounded-lg border shadow-xs">
          {/* Chart Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>

          {/* Chart Content */}
          <div className="p-6">
            <div className="h-[250px] w-full flex items-end justify-center space-x-2">
              {/* Chart Bars */}
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-2"
                >
                  <Skeleton
                    className="w-8"
                    style={{ height: `${Math.random() * 150 + 50}px` }}
                  />
                  <Skeleton className="h-3 w-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        {/* Table Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-lg border">
          {/* Table Header Row */}
          <div className="bg-muted sticky top-0 z-10">
            <div className="flex items-center px-6 py-3">
              <Skeleton className="h-4 w-16" />
              <div className="flex-1 ml-8">
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-4 w-20 ml-8" />
              <Skeleton className="h-4 w-16 ml-8" />
              <Skeleton className="h-4 w-20 ml-8" />
            </div>
          </div>

          {/* Table Body - Loading Rows */}
          <div className="bg-background divide-y divide-border">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center px-6 py-4 hover:bg-muted/50"
              >
                {/* Checkbox Skeleton */}
                <div className="flex items-center justify-center w-4">
                  <Skeleton className="h-4 w-4 rounded" />
                </div>

                {/* Avatar and Name */}
                <div className="flex items-center space-x-3 ml-8 flex-1">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>

                {/* Role Badge */}
                <div className="ml-8">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                {/* Status Badge */}
                <div className="ml-8">
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>

                {/* Joined Date */}
                <div className="ml-8">
                  <Skeleton className="h-4 w-24" />
                </div>

                {/* Actions */}
                <div className="ml-8">
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
