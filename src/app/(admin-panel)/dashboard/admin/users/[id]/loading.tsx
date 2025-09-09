import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="body-content px-8 py-8 bg-slate-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        {/* Avatar Skeleton */}
        <Skeleton className="w-24 h-24 rounded-full mb-4" />

        {/* Name Skeleton */}
        <Skeleton className="h-9 w-48 mb-2" />

        {/* Email Skeleton */}
        <Skeleton className="h-6 w-64 mb-4" />

        {/* Role and Status Badges */}
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>

        {/* Joined Date Skeleton */}
        <Skeleton className="h-4 w-32 mb-6" />

        {/* User Details Grid */}
        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 gap-3 text-base">
            {/* Phone */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Address */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-40" />
            </div>

            {/* Last Updated */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>

            {/* Joined */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </div>

        {/* Back Button Skeleton */}
        <Skeleton className="h-10 w-32 mt-6" />
      </div>
    </div>
  );
}
