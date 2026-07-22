/**
 * GET /api/exception/:id/run
 * Server-Sent Events stream of FreightDesk agent execution
 */

import { createSSEStream } from '@/src/agent';
import { requireSubconsciousApiKey } from '@/lib/subconscious';
import { checkProxySecret } from '@/lib/proxy-guard';
import { MOCK_EXCEPTIONS } from '@/src/mocks/exceptions';

export const maxDuration = 300;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = checkProxySecret(request);
  if (forbidden) return forbidden;

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

  // Only seeded hero cases are runnable — anything else is a waste of credits.
  if (!MOCK_EXCEPTIONS.some((e) => e.exception_id === exceptionId)) {
    return Response.json(
      { error: `Unknown exception ${exceptionId}` },
      { status: 404 }
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
