import { NextResponse } from 'next/server';
import { generateGateDensities } from '@/lib/mock-data-generator';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stadiumId = searchParams.get('stadiumId') || undefined;
    const densities = generateGateDensities(stadiumId);

    return NextResponse.json({ densities, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Failed to get density data' }, { status: 500 });
  }
}
