/**
 * sendNotifications - Send emails and notifications
 * SPONSOR: Cloudflare (Cloudflare Email Workers)
 */

import type { DraftMessages } from './draftMessages';

export interface NotificationResult {
  sent: boolean;
  timestamp: string;
  carrier_sent?: boolean;
  customer_sent?: boolean;
  ar_sent?: boolean;
}

export async function sendNotifications(
  drafts: DraftMessages,
  carrier?: string
): Promise<NotificationResult> {

  // TODO: swap console.log for real email API
  // (SendGrid, Resend, or Cloudflare Email Workers)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 SENDING NOTIFICATIONS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let carrierSent = false;
  let customerSent = false;
  let arSent = false;

  if (drafts.carrier_message) {
    console.log(`📦 SENDING TO CARRIER (${carrier || 'Unknown'}):`);
    console.log(drafts.carrier_message);
    console.log('\n');
    carrierSent = true;
  }

  if (drafts.customer_message) {
    console.log('👤 SENDING TO CUSTOMER:');
    console.log(drafts.customer_message);
    console.log('\n');
    customerSent = true;
  }

  if (drafts.ar_note) {
    console.log('💰 SENDING TO AR (Accounting):');
    console.log(drafts.ar_note);
    console.log('\n');
    arSent = true;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return {
    sent: true,
    timestamp: new Date().toISOString(),
    carrier_sent: carrierSent,
    customer_sent: customerSent,
    ar_sent: arSent
  };
}
