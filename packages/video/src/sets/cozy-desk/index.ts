import { createCozyDesk } from './create-cozy-desk';

export const cozyDesk = createCozyDesk('cozy-desk', 'Cosy home office at sunset: window on a city, sleeping cat, desk with monitor and coffee.', {
  timeOfDay: 'sunset',
  rain: false,
  cat: 'asleep',
  monitor: 'code',
});

export const cozyDeskNight = createCozyDesk('cozy-desk-night', 'Same home office at night in the rain: moon, lit windows, the cat is awake.', {
  timeOfDay: 'night',
  rain: true,
  cat: 'awake',
  monitor: 'code',
});
