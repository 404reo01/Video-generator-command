import type { Transcript } from '@mappa/shared';

export interface TranscribeRequest {
  /** Path to a WAV file prepared by `prepareSource` (mono, 48 kHz). */
  readonly audioPath: string;
  readonly durationMs: number;
  /** ISO-639-1 code; omit to let the provider detect the language. */
  readonly languageCode?: string;
}

/** Any speech-to-text service. It must return fillers verbatim and word-level timestamps. */
export interface TranscriptionProvider {
  readonly name: string;
  transcribe(request: TranscribeRequest): Promise<Transcript>;
}
