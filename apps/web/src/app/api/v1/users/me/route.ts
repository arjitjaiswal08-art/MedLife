import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    id: 'usr_me',
    email: 'user@example.com',
    display_name: 'Patient',
    default_city: 'Delhi',
    language_pref: 'en',
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      message: 'Profile updated',
      profile: body,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 400 });
  }
}
