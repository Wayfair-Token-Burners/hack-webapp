/**
 * GET /api/queue
 * Returns all mock exceptions for FreightDesk
 */

import { MOCK_EXCEPTIONS } from '@/src/mocks/exceptions';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    total: MOCK_EXCEPTIONS.length,
    exceptions: MOCK_EXCEPTIONS
  });
}
