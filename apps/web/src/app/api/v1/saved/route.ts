import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ saved: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ success: true, saved: body });
}
