import { NextRequest, NextResponse } from 'next/server';
import { DOCTORS_DATABASE, haversineDistance, formatDistance } from '@/lib/doctors-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const toPlaceId = searchParams.get('to_place_id');
    const fromLat = parseFloat(searchParams.get('from_lat') || '28.6139');
    const fromLng = parseFloat(searchParams.get('from_lng') || '77.2090');

    const place = DOCTORS_DATABASE.find((p) => p.place_id === toPlaceId) || DOCTORS_DATABASE[0];
    const distMeters = haversineDistance(fromLat, fromLng, place.location.lat, place.location.lng);
    const approxMinutes = Math.max(5, Math.round((distMeters / 1000) * 2.5));

    return NextResponse.json({
      distance_meters: distMeters,
      duration_seconds: approxMinutes * 60,
      duration_label: `${approxMinutes} mins (${formatDistance(distMeters)})`,
      maps_deeplink: `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}&travelmode=driving`,
    });
  } catch (error) {
    console.error('Error fetching route:', error);
    return NextResponse.json(
      { error: 'Failed to calculate route' },
      { status: 500 }
    );
  }
}
