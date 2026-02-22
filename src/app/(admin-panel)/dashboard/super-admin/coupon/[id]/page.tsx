import { redirect } from 'next/navigation';

export default async function CouponEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  redirect('/dashboard/super-admin/coupon');
}
