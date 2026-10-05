import { openAsBlob } from 'node:fs';
import { TranscriptSchema, type Transcript } from '@mappa/shared';
import { z } from 'zod';
import type { TranscribeRequest, TranscriptionProvider } from './transcription-provider';

const ENDPOINT = 'https://api.elevenlabs.io/v1/speech-to-text';
const MODEL_ID = 'scribe_v2';

const ElevenLabsWordSchema = z.object({
  text: z.string(),
  start: z.number().optional(),
  end: z.number().optional(),
  type: z.enum(['word', 'spacing', 'audio_event']),
  logprob: z.number().optional(),
});

export const ElevenLabsResponseSchema = z.object({
  language_code: z.string(),
  words: z.array(ElevenLabsWordSchema),
});
export type ElevenLabsResponse = z.infer<typeof ElevenLabsResponseSchema>;

/** Maps Scribe's response (seconds, spacing tokens) to our transcript (integer ms, spoken tokens only). */
export function fromElevenLabsResponse(response: ElevenLabsResponse, durationMs: number): Transcript {
  const words = response.words
    .filter((w) => w.type !== 'spacing' && w.text.trim() !== '' && w.start !== undefined && w.end !== undefined)
    .map((w) => {
      const startMs = Math.round((w.start ?? 0) * 1000);
      return {
        text: w.text.trim(),
        startMs,
        endMs: Math.max(startMs, Math.round((w.end ?? 0) * 1000)),
        kind: w.type === 'audio_event' ? ('event' as const) : ('word' as const),
        ...(w.logprob === undefined ? {} : { confidence: Math.min(1, Math.max(0, Math.exp(w.logprob))) }),
      };
    });
  return TranscriptSchema.parse({ provider: `elevenlabs:${MODEL_ID}`, language: response.language_code, durationMs, words });
}

export class ElevenLabsProvider implements TranscriptionProvider {
  readonly name = 'elevenlabs';

  constructor(private readonly apiKey: string) {
    if (!apiKey) throw new Error('ELEVENLABS_API_KEY is empty: copy .env.example to .env and set it');
  }

  async transcribe(request: TranscribeRequest): Promise<Transcript> {
    const form = new FormData();
    form.append('file', await openAsBlob(request.audioPath), 'source.wav');
    form.append('model_id', MODEL_ID);
    form.append('timestamps_granularity', 'word');
    form.append('tag_audio_events', 'true');
    // Verbatim is the default; stated explicitly because fillers are exactly what we need to see.
    form.append('no_verbatim', 'false');
    if (request.languageCode) form.append('language_code', request.languageCode);

    const response = await fetch(ENDPOINT, { method: 'POST', headers: { 'xi-api-key': this.apiKey }, body: form });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      throw new Error(`ElevenLabs speech-to-text failed (${String(response.status)}): ${detail}`);
    }
    return fromElevenLabsResponse(ElevenLabsResponseSchema.parse(await response.json()), request.durationMs);
  }
}
