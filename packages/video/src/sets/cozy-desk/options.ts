export type TimeOfDay = 'sunset' | 'night';
export type CatState = 'asleep' | 'awake' | 'none';
export type MonitorState = 'code' | 'off';

/** Variants of the cozy desk; each registered set picks one. */
export interface CozyDeskOptions {
  readonly timeOfDay: TimeOfDay;
  readonly rain: boolean;
  readonly cat: CatState;
  readonly monitor: MonitorState;
}
