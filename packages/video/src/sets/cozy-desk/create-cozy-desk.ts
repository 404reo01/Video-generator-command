import type { SetDefinition } from '../set-definition';
import { paintCat } from './cat';
import { paintCity } from './city';
import { paintDesk, paintScreen, paintSteam } from './desk';
import type { CozyDeskOptions } from './options';
import { paintRain } from './rain';
import { paintRoom } from './room';
import { paintClouds, paintSky } from './sky';

// Painters work in a 540x960 space; the world is 1080x1920.
const PAINT_SCALE = 2;

/** Builds the cozy desk set: sky, city, room and cat behind the character, the desk setup in front. */
export function createCozyDesk(id: string, description: string, options: CozyDeskOptions): SetDefinition {
  return {
    id,
    description,
    background: '#1d1526',
    layers: [
      {
        id: 'sky',
        depth: 0.15,
        paint: (ctx, t) => {
          ctx.scale(PAINT_SCALE, PAINT_SCALE);
          paintSky(ctx, t, options.timeOfDay);
          paintClouds(ctx, t, options.timeOfDay);
        },
      },
      {
        id: 'city',
        depth: 0.35,
        paint: (ctx, t) => {
          ctx.scale(PAINT_SCALE, PAINT_SCALE);
          paintCity(ctx, t, options.timeOfDay);
          if (options.rain) paintRain(ctx, t);
        },
      },
      {
        id: 'room',
        depth: 0.85,
        paint: (ctx, t) => {
          ctx.scale(PAINT_SCALE, PAINT_SCALE);
          paintRoom(ctx);
          paintCat(ctx, t, options.cat);
        },
      },
      'character',
      {
        id: 'desk',
        depth: 1.08,
        paint: (ctx, t) => {
          ctx.scale(PAINT_SCALE, PAINT_SCALE);
          paintDesk(ctx, options.monitor);
          paintScreen(ctx, t, options.monitor);
          paintSteam(ctx, t);
        },
      },
    ],
    // Standing behind the desk: head around world y 1250, the desk top (y 1632) hiding the legs below the hips.
    // Full-body stickers keep headroom above the head for effects, hence the tall sticker box.
    character: { x: 30, bottom: 1732, height: 600 },
  };
}
