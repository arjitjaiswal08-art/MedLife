import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, display_name } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = display_name?.trim() || cleanEmail.split('@')[0];
    const token = `jwt_medlife_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json({
      access_token: token,
      refresh_token: `rf_${token}`,
      token_type: 'bearer',
      user: {
        id: `usr_${Date.now()}`,
        email: cleanEmail,
        display_name: cleanName,
        language_pref: 'en',
      },
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
