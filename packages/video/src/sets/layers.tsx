import type { JSX, ReactNode } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill } from 'remotion';
import { viewTransform, type View } from '../camera/camera';
import { VIDEO } from '../theme/tokens';

/**
 * Building blocks for set layers. Each one takes the layer's `view` and handles the camera transform,
 * so a set only draws in world coordinates (1080x1920) and stays sharp at any zoom.
 */

/** Vector layer: children are SVG elements in world coordinates. Re-rasterised at every zoom. */
export function SvgLayer({ view, children }: { readonly view: View; readonly children: ReactNode }): JSX.Element {
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox={`${String(view.x)} ${String(view.y)} ${String(view.width)} ${String(view.height)}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        {children}
      </svg>
    </AbsoluteFill>
  );
}

/** Canvas layer: `paint` draws in world coordinates; the context is already transformed for the view. */
export function CanvasLayer({ view, t, paint }: { readonly view: View; readonly t: number; readonly paint: (ctx: CanvasRenderingContext2D, t: number) => void }): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, VIDEO.width, VIDEO.height);
    const { scale, dx, dy } = viewTransform(view);
    ctx.setTransform(scale, 0, 0, scale, dx, dy);
    paint(ctx, t);
  }, [view, t, paint]);
  return (
    <AbsoluteFill>
      <canvas ref={ref} width={VIDEO.width} height={VIDEO.height} style={{ width: '100%', height: '100%' }} />
    </AbsoluteFill>
  );
}

/** HTML layer: children are absolutely positioned in world pixels and scaled with the view. */
export function DomLayer({ view, children }: { readonly view: View; readonly children: ReactNode }): JSX.Element {
  const { scale, dx, dy } = viewTransform(view);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: VIDEO.width, height: VIDEO.height, transformOrigin: '0 0', transform: `translate(${String(dx)}px, ${String(dy)}px) scale(${String(scale)})` }}>
        {children}
      </div>
    </AbsoluteFill>
  );
}
