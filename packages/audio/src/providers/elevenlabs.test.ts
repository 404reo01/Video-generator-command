import { describe, expect, it } from 'vitest';
import { ElevenLabsResponseSchema, fromElevenLabsResponse } from './elevenlabs';

// Shape documented at https://elevenlabs.io/docs/api-reference/speech-to-text/convert
const RESPONSE = ElevenLabsResponseSchema.parse({
  language_code: 'fra',
  language_probability: 0.99,
  text: 'Salut euh (rires) ça va',
  words: [
    { text: 'Salut', start: 0.12, end: 0.48, type: 'word', logprob: -0.01 },
    { text: ' ', start: 0.48, end: 0.6, type: 'spacing', logprob: 0 },
    { text: 'euh', start: 0.6, end: 0.95, type: 'word', logprob: -0.2 },
    { text: '(rires)', start: 1.0, end: 1.6, type: 'audio_event', logprob: -0.5 },
    { text: 'ça', start: 1.7, end: 1.82, type: 'word' },
    { text: 'va', start: 1.85, end: 2.0, type: 'word' },
  ],
});

describe('fromElevenLabsResponse', () => {
  const transcript = fromElevenLabsResponse(RESPONSE, 2500);

  it('drops spacing tokens and converts seconds to integer milliseconds', () => {
    expect(transcript.words.map((w) => [w.text, w.startMs, w.endMs])).toEqual([
      ['Salut', 120, 480],
      ['euh', 600, 950],
      ['(rires)', 1000, 1600],
      ['ça', 1700, 1820],
      ['va', 1850, 2000],
    ]);
  });

  it('keeps fillers verbatim and marks sound events', () => {
    expect(transcript.words.find((w) => w.text === 'euh')?.kind).toBe('word');
    expect(transcript.words.find((w) => w.text === '(rires)')?.kind).toBe('event');
  });

  it('turns log-probabilities into a 0-1 confidence', () => {
    expect(transcript.words[0]?.confidence).toBeCloseTo(0.99, 2);
    expect(transcript.words[3]?.confidence).toBeUndefined();
  });
});
