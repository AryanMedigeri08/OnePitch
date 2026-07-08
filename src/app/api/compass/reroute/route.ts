import { NextResponse } from 'next/server';
import { closeGate, openGate, getClosedGates } from '@/lib/mock-data-generator';

export async function POST(req: Request) {
  try {
    const { gateId, action } = await req.json();

    if (action === 'close') {
      closeGate(gateId);
    } else if (action === 'open') {
      openGate(gateId);
    }

    return NextResponse.json({
      success: true,
      closedGates: getClosedGates(),
      message: `Gate ${gateId} ${action === 'close' ? 'closed' : 'opened'} successfully.`,
    });
  } catch (error) {
    console.error('Reroute error:', error);
    return NextResponse.json({ error: 'Failed to process reroute' }, { status: 500 });
  }
}
