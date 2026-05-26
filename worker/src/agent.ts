/**
 * FreightDesk AI Agent
 * Main orchestrator that runs tools in sequence and streams SSE events
 */

import { lookupOrder, type OrderLookupResult } from './tools/lookupOrder';
import { readPhoto, type PhotoAnalysis } from './tools/readPhoto';
import { transcribeAudio, type AudioTranscription } from './tools/transcribeAudio';
import { decide, type DecisionResult, type DispositionCode } from './tools/decide';
import { draftMessages, type DraftMessages } from './tools/draftMessages';
import { sendNotifications, type NotificationResult } from './tools/sendNotifications';

export interface AgentStep {
  step: number;
  tool: string;
  sponsor: string;
  input: any;
  output: any;
  timestamp: string;
}

export interface AgentResult {
  exception_id: string;
  disposition_code: DispositionCode;
  confidence: number;
  dollar_impact: number;
  drafts: DraftMessages;
  steps: AgentStep[];
  completed_at: string;
}

export class FreightDeskAgent {
  private exceptionId: string;
  private apiKey: string;
  private steps: AgentStep[] = [];
  private stepCount = 0;

  constructor(exceptionId: string, apiKey: string) {
    this.exceptionId = exceptionId;
    this.apiKey = apiKey;
  }

  /**
   * Run the agent and yield SSE events for each step
   */
  async *run(): AsyncGenerator<AgentStep | AgentResult> {
    try {
      // Step 1: Lookup order
      const orderResult = await this.executeStep(
        'lookupOrder',
        'Cloudflare',
        { exception_id: this.exceptionId },
        async () => await lookupOrder(this.exceptionId)
      );
      yield orderResult.step;

      if (!orderResult.output.found) {
        throw new Error(`Exception ${this.exceptionId} not found`);
      }

      const orderData: OrderLookupResult = orderResult.output;

      // Step 2: Read photo (if available)
      let photoAnalysis: PhotoAnalysis | null = null;
      if (orderData.evidence?.photo_url) {
        const photoResult = await this.executeStep(
          'readPhoto',
          'Cloudflare',
          { photo_url: orderData.evidence.photo_url, exception_id: this.exceptionId },
          async () => await readPhoto(orderData.evidence!.photo_url!, this.exceptionId)
        );
        yield photoResult.step;
        photoAnalysis = photoResult.output;
      }

      // Step 3: Transcribe audio (if available)
      let audioTranscript: AudioTranscription | null = null;
      if (orderData.evidence?.audio_url) {
        const audioResult = await this.executeStep(
          'transcribeAudio',
          'Baseten',
          { audio_url: orderData.evidence.audio_url, exception_id: this.exceptionId },
          async () => await transcribeAudio(orderData.evidence!.audio_url!, this.exceptionId)
        );
        yield audioResult.step;
        audioTranscript = audioResult.output;
      }

      // Step 4: Make decision
      const decisionResult = await this.executeStep(
        'decide',
        'Subconscious',
        {
          order_data: orderData,
          photo_analysis: photoAnalysis,
          audio_transcript: audioTranscript
        },
        async () => await decide(orderData, photoAnalysis, audioTranscript, this.apiKey)
      );
      yield decisionResult.step;

      const decision: DecisionResult = decisionResult.output;

      // Step 5: Draft messages
      const draftsResult = await this.executeStep(
        'draftMessages',
        'Subconscious',
        {
          disposition_code: decision.disposition_code,
          exception_id: this.exceptionId,
          customer_name: orderData.order!.customer_name,
          order_sku: orderData.order!.sku,
          dollar_impact: orderData.dollar_impact!,
          reasoning: decision.reasoning,
          carrier: orderData.carrier
        },
        async () => await draftMessages(
          decision.disposition_code,
          this.exceptionId,
          orderData.order!.customer_name,
          orderData.order!.sku,
          orderData.dollar_impact!,
          decision.reasoning,
          this.apiKey,
          orderData.carrier
        )
      );
      yield draftsResult.step;

      // Step 6: Send notifications
      const notificationsResult = await this.executeStep(
        'sendNotifications',
        'Cloudflare',
        {
          drafts: draftsResult.output,
          carrier: orderData.carrier
        },
        async () => await sendNotifications(
          draftsResult.output,
          orderData.carrier
        )
      );
      yield notificationsResult.step;

      // Final result
      const result: AgentResult = {
        exception_id: this.exceptionId,
        disposition_code: decision.disposition_code,
        confidence: decision.confidence,
        dollar_impact: orderData.dollar_impact!,
        drafts: draftsResult.output,
        steps: this.steps,
        completed_at: new Date().toISOString()
      };

      yield result;

    } catch (error) {
      console.error('Agent error:', error);
      throw error;
    }
  }

  /**
   * Execute a single tool step and record it
   */
  private async executeStep(
    tool: string,
    sponsor: string,
    input: any,
    execute: () => Promise<any>
  ): Promise<{ step: AgentStep; output: any }> {
    this.stepCount++;

    const output = await execute();

    const step: AgentStep = {
      step: this.stepCount,
      tool,
      sponsor,
      input,
      output,
      timestamp: new Date().toISOString()
    };

    this.steps.push(step);

    return { step, output };
  }
}

/**
 * Helper to create SSE response stream
 */
export function createSSEStream(exceptionId: string, apiKey: string): ReadableStream {
  const agent = new FreightDeskAgent(exceptionId, apiKey);

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const event of agent.run()) {
          // Format as SSE
          const data = JSON.stringify(event);
          const message = `data: ${data}\n\n`;
          controller.enqueue(encoder.encode(message));
        }

        // Send done event
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        const errorMsg = `data: ${JSON.stringify({ error: String(error) })}\n\n`;
        controller.enqueue(encoder.encode(errorMsg));
        controller.close();
      }
    }
  });
}
