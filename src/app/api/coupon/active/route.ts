import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: 'Backend URL not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${backendUrl}/api/coupon/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't cache the response to ensure fresh data
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch active coupons' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Route] Error fetching active coupons:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

