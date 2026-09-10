import { NextRequest, NextResponse } from 'next/server';
import { DOCTORS_DATABASE } from '@/lib/doctors-db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
) {
  try {
    const { placeId } = await params;
    const place = DOCTORS_DATABASE.find((p) => p.place_id === placeId) || DOCTORS_DATABASE[0];

    return NextResponse.json({
      place_id: place.place_id,
      name: place.name,
      address: place.address,
      phone: place.phone,
      rating: place.rating,
      review_count: place.review_count,
      open_now: place.open_now,
      location: place.location,
      speciality: place.speciality,
      website: place.website || 'https://healthcare-finder.vercel.app',
      photos: place.photos || [place.photo_url],
      reviews: [
        {
          author: 'Ananya Verma',
          rating: 5,
          text: 'Excellent medical consultation and prompt diagnostic attention. Highly recommend.',
        },
        {
          author: 'Rajesh Nair',
          rating: 4.8,
          text: 'Experienced specialists with clean modern facilities and supportive staff.',
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching place detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place detail' },
      { status: 500 }
    );
  }
}
