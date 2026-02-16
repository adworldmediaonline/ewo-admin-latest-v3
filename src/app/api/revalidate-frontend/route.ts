import { NextResponse } from 'next/server';

/**
 * Proxies revalidation to the live frontend (storefront).
 * Keeps REVALIDATION_SECRET server-side. Called after CMS content updates.
 */
export async function POST() {
  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL;
  const secret = process.env.REVALIDATION_SECRET;

  if (!storefrontUrl?.trim()) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_STOREFRONT_URL not configured' },
      { status: 500 }
    );
  }

  if (!secret?.trim()) {
    return NextResponse.json(
      { error: 'REVALIDATION_SECRET not configured' },
      { status: 500 }
    );
  }

  try {
    const base = storefrontUrl.replace(/\/$/, '');
    const res = await fetch(`${base}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, tag: 'cms' }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error ?? 'Revalidation failed', status: res.status },
        { status: 502 }
      );
    }

    return NextResponse.json({ revalidated: true, ...data });
  } catch (error) {
    console.error('Revalidate frontend error:', error);
    return NextResponse.json(
      { error: 'Failed to reach frontend' },
      { status: 502 }
    );
  }
}
