/**
 * transcribeAudio - Baseten speech-to-text (mocked)
 * Transcribes audio evidence (driver voicemails, customer calls)
 */

export interface AudioTranscription {
  transcript: string;
  speaker?: string;
  key_phrases?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  fault_admission?: boolean;
  confidence: number;
}

// Mock Baseten audio transcription - hardcoded realistic responses
export async function transcribeAudio(audioUrl: string, exceptionId: string): Promise<AudioTranscription> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 150));

  if (exceptionId === 'HERO-1') {
    return {
      transcript: "Hey, this is Mike from FedEx Freight. Just wanted to give you a heads up - I had to make a quick stop on your delivery this morning and, uh, the sofa might have shifted in the truck. When I was unloading it, I noticed the corner looked a bit banged up. I think it might have happened when I took that turn too fast on Route 9. Sorry about that. Customer signed for it but mentioned the damage. Give me a call back if you need anything. Thanks.",
      speaker: 'FedEx Driver Mike',
      key_phrases: [
        'took that turn too fast',
        'corner looked a bit banged up',
        'might have shifted in the truck',
        'happened when I took that turn'
      ],
      sentiment: 'negative',
      fault_admission: true,
      confidence: 0.94
    };
  }

  if (exceptionId === 'HERO-5') {
    return {
      transcript: "This is the Pilot Freight dispatch. Driver called in - unable to make the 2pm delivery window for order WF-ORD-2024-88920. Customer wasn't home, no answer at door. We have a 4-6pm slot available today or tomorrow morning 9-11am. Please advise.",
      speaker: 'Pilot Freight Dispatch',
      key_phrases: [
        'unable to make the 2pm delivery window',
        'customer wasn\'t home',
        '4-6pm slot available today'
      ],
      sentiment: 'neutral',
      fault_admission: false,
      confidence: 0.96
    };
  }

  // Default - no audio available
  return {
    transcript: '',
    confidence: 0,
    fault_admission: false
  };
}
