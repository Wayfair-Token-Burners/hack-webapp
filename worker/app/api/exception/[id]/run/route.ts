/**
 * GET /api/exception/:id/run
 * Server-Sent Events stream of FreightDesk agent execution
 */

import { createSSEStream } from '@/src/agent';
import { requireSubconsciousApiKey } from '@/lib/subconscious';

export const maxDuration = 300;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireSubconsciousApiKey();
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error
          ? error.message
          : 'Missing Subconscious API key'
      },
      { status: 500 }
    );
  }

  const { id: exceptionId } = await params;

  if (!exceptionId) {
    return Response.json(
      { error: 'Exception ID required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.SUBCONSCIOUS_API_KEY!;
  const stream = createSSEStream(exceptionId, apiKey);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
