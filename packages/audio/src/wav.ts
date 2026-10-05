/** Duration of a PCM WAV file read from its header: data chunk size divided by byte rate. */
export function wavDurationMs(buffer: Uint8Array): number {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const tag = (offset: number): string => String.fromCharCode(...buffer.subarray(offset, offset + 4));
  if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('not a RIFF/WAVE file');

  let byteRate = 0;
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const id = tag(offset);
    const size = view.getUint32(offset + 4, true);
    // fmt body: format(2) channels(2) sampleRate(4) byteRate(4) — byteRate sits 8 bytes into the body.
    if (id === 'fmt ') byteRate = view.getUint32(offset + 16, true);
    if (id === 'data') {
      if (byteRate === 0) throw new Error('WAV data chunk found before its fmt chunk');
      return Math.round((size / byteRate) * 1000);
    }
    offset += 8 + size + (size % 2);
  }
  throw new Error('WAV file has no data chunk');
}
