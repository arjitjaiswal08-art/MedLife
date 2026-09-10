import { NextRequest, NextResponse } from 'next/server';
import { analyzeSymptoms } from '@/lib/triage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptom_text, city } = body || {};

    if (!symptom_text || typeof symptom_text !== 'string') {
      return NextResponse.json(
        { error: 'symptom_text is required' },
        { status: 400 }
      );
    }

    const result = await analyzeSymptoms(symptom_text, city);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in analyze-symptoms route:', error);
    return NextResponse.json(
      { error: 'Failed to analyze symptoms' },
      { status: 500 }
    );
  }
}
