import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ history: [] });
}

export async function DELETE() {
  return NextResponse.json({ success: true, message: 'History cleared' });
}
