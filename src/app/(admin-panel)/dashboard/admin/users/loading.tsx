import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 lg:px-6">
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
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          {/* Table Header */}
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
            {Array.from({ length: 8 }).map((_, index) => (
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
