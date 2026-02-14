import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { target } = body;

    // Simple logic: "yes" always hits, "no" always misses
    if (target === 'yes') {
      return NextResponse.json({ success: true, message: 'Score!' });
    } else if (target === 'no') {
      return NextResponse.json({ success: false, message: 'Missed!' });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid target' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
