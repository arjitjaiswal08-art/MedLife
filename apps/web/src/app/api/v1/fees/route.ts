import { NextRequest, NextResponse } from 'next/server';
import { getFeeEstimate } from '@/lib/triage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialist = searchParams.get('specialist_type') || 'General Physician';
    const city = searchParams.get('city') || undefined;

    const fee = getFeeEstimate(specialist, city);
    return NextResponse.json({
      ...fee,
      specialist_type: specialist,
      city: city || 'India',
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fee estimate' },
      { status: 500 }
    );
  }
}
