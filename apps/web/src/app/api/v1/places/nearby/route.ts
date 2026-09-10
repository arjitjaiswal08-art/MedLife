import { NextRequest, NextResponse } from 'next/server';
import { DOCTORS_DATABASE, haversineDistance, formatDistance } from '@/lib/doctors-db';
import { getFeeEstimate } from '@/lib/triage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const cityParam = searchParams.get('city');
    const specialistParam = searchParams.get('specialist_type');
    const emergency = searchParams.get('emergency') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const userLat = latParam ? parseFloat(latParam) : 28.6139;
    const userLng = lngParam ? parseFloat(lngParam) : 77.2090;

    let filtered = [...DOCTORS_DATABASE];

    // Filter by city if specified
    if (cityParam) {
      const cityLower = cityParam.toLowerCase();
      const cityMatches = filtered.filter(
        (p) => p.city.toLowerCase().includes(cityLower) || cityLower.includes(p.city.toLowerCase())
      );
      if (cityMatches.length > 0) {
        filtered = cityMatches;
      }
    }

    // Filter by specialist if provided
    if (specialistParam) {
      const specLower = specialistParam.toLowerCase();
      const specMatches = filtered.filter((p) => {
        const specMatch = p.speciality.toLowerCase().includes(specLower);
        const typeMatch = p.specialist_types.some((t) =>
          t.toLowerCase().includes(specLower) || specLower.includes(t.toLowerCase())
        );
        return specMatch || typeMatch || (emergency && p.emergency_capable);
      });
      if (specMatches.length > 0) {
        filtered = specMatches;
      }
    }

    // Map distance and score
    const results = filtered.map((p) => {
      const distMeters = haversineDistance(userLat, userLng, p.location.lat, p.location.lng);
      const feeRange = getFeeEstimate(p.specialist_types[0] || 'General Physician', cityParam || p.city);

      return {
        place_id: p.place_id,
        name: p.name,
        place_type: p.place_type,
        address: p.address,
        phone: p.phone,
        rating: p.rating,
        review_count: p.review_count,
        open_now: p.open_now,
        distance_meters: distMeters,
        distance_label: formatDistance(distMeters),
        fee_estimate: {
          min: feeRange.min,
          max: feeRange.max,
          currency: 'INR',
        },
        specialist_types: p.specialist_types,
        score: p.rating,
        emergency_capable: p.emergency_capable,
        location: p.location,
        maps_url: `https://www.google.com/maps/search/?api=1&query=${p.location.lat},${p.location.lng}`,
        photo_url: p.photo_url,
        speciality: p.speciality,
      };
    });

    // Sort by rating and proximity
    results.sort((a, b) => {
      if (emergency) {
        if (a.emergency_capable !== b.emergency_capable) return a.emergency_capable ? -1 : 1;
      }
      return b.rating - a.rating;
    });

    const paginated = results.slice(0, limit);

    return NextResponse.json({
      results: paginated,
      total: paginated.length,
      radius_used: 15000,
      emergency_mode: emergency,
      city: cityParam || 'India',
    });
  } catch (error) {
    console.error('Error in nearby places route:', error);
    return NextResponse.json(
      { error: 'Failed to search places' },
      { status: 500 }
    );
  }
}
