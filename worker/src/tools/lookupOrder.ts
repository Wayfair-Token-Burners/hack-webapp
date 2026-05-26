/**
 * lookupOrder - Cloudflare Worker tool
 * Looks up order details from mock data
 */

import { MOCK_EXCEPTIONS, Exception } from '../mocks/exceptions';

export interface OrderLookupResult {
  found: boolean;
  exception?: Exception;
  order?: {
    id: string;
    sku: string;
    customer_name: string;
    ltv_band: string;
    sla_tier: string;
  };
  carrier?: string;
  dollar_impact?: number;
  evidence?: {
    photo_url?: string;
    audio_url?: string;
    pdf_url?: string;
  };
}

export async function lookupOrder(exceptionId: string): Promise<OrderLookupResult> {
  const exception = MOCK_EXCEPTIONS.find(e => e.exception_id === exceptionId);

  if (!exception) {
    return { found: false };
  }

  return {
    found: true,
    exception,
    order: exception.order,
    carrier: exception.carrier,
    dollar_impact: exception.dollar_impact,
    evidence: exception.evidence
  };
}
