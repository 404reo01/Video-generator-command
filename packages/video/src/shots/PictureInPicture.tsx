import type { CharacterManifest } from '@mappa/shared';
import type { JSX } from 'react';
import { Img } from 'remotion';
import { stickerSrc } from '../character/CharacterSticker';
import { LAYOUT } from '../theme/tokens';
import { useStyle } from '../theme/style-context';
import { enter } from '../timing/envelope';

// The face fills this share of the circle's diameter.
const FACE_SHARE = 0.62;

/** Round inset of the character's face, used while an illustration takes the screen. */
export function PictureInPicture({ manifest, emotion, startMs, t }: { readonly manifest: CharacterManifest; readonly emotion: string; readonly startMs: number; readonly t: number }): JSX.Element {
  const { colors } = useStyle();
  const { size, left, top } = LAYOUT.pip;
  const scale = (size * FACE_SHARE) / manifest.face.width;
  const k = enter(t, startMs + 120, 360);
  return (
    <div style={{ position: 'absolute', left, top, width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: `8px solid ${colors.accent}`, background: colors.surface, boxShadow: '0 18px 40px rgba(10,5,15,.5)', scale: String(0.6 + 0.4 * k), opacity: k }}>
      <Img
        src={stickerSrc(manifest, emotion)}
        style={{
          position: 'absolute',
          width: manifest.width * scale,
          height: manifest.height * scale,
          left: size / 2 - (manifest.face.x + manifest.face.width / 2) * scale,
          top: size / 2 - (manifest.face.y + manifest.face.height * 0.55) * scale,
          imageRendering: manifest.style === 'pixel' ? 'pixelated' : 'auto',
        }}
      />
    </div>
  );
}
