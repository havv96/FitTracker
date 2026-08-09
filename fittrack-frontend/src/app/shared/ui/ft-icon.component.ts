import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type IconName =
  | 'grid'
  | 'dumbbell'
  | 'fork'
  | 'list'
  | 'chart'
  | 'user'
  | 'history'
  | 'search'
  | 'sun'
  | 'moon'
  | 'globe'
  | 'plus'
  | 'minus'
  | 'x'
  | 'check'
  | 'edit'
  | 'trash'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'chevron-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-down'
  | 'bell'
  | 'clock'
  | 'timer'
  | 'calendar'
  | 'flame'
  | 'trophy'
  | 'scale'
  | 'logout'
  | 'save'
  | 'external'
  | 'menu'
  | 'logo';

/**
 * Icon component. Renders one of a fixed set of inline SVGs using `currentColor`
 * so the parent's `color` controls the stroke. All icons drawn at 16x16 viewBox.
 */
@Component({
  selector: 'ft-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      [innerHTML]="body()"
    ></svg>
  `,
  styles: [`:host { display: inline-flex; line-height: 0; }`],
})
export class FtIconComponent {
  readonly name = input.required<IconName>();
  readonly size = input<number>(16);

  readonly body = computed(() => ICONS[this.name()] ?? ICONS['grid']);
}

const S = 'stroke="currentColor"';
const SW = 'stroke-width="1.4"';
const SL = 'stroke-linecap="round" stroke-linejoin="round"';

const ICONS: Record<IconName, string> = {
  grid: `<rect x="2" y="2" width="5" height="5" rx="1" ${S} ${SW}/><rect x="9" y="2" width="5" height="5" rx="1" ${S} ${SW}/><rect x="2" y="9" width="5" height="5" rx="1" ${S} ${SW}/><rect x="9" y="9" width="5" height="5" rx="1" ${S} ${SW}/>`,
  dumbbell: `<path d="M2 8h2M12 8h2M4 8c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" ${S} ${SW} ${SL}/>`,
  fork: `<path d="M8 2v12M4 5s0 3 4 3 4-3 4-3" ${S} ${SW} ${SL}/>`,
  list: `<path d="M3 4h10M3 8h6M3 12h8" ${S} ${SW} ${SL}/>`,
  chart: `<path d="M2 12l4-4 3 2 4-6" ${S} ${SW} ${SL}/>`,
  user: `<circle cx="8" cy="5.5" r="2.5" ${S} ${SW}/><path d="M3 13c0-2.8 2.2-5 5-5s5 2.2 5 5" ${S} ${SW} ${SL}/>`,
  history: `<path d="M8 4v4l3 2" ${S} ${SW} ${SL}/><path d="M2.5 8a5.5 5.5 0 105.5-5.5c-1.6 0-3 .7-4 1.8" ${S} ${SW} ${SL}/><path d="M2 3v2.5h2.5" ${S} ${SW} ${SL}/>`,
  search: `<circle cx="7" cy="7" r="4.5" ${S} ${SW}/><path d="M10.5 10.5L14 14" ${S} ${SW} ${SL}/>`,
  sun: `<circle cx="8" cy="8" r="3" ${S} ${SW}/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1 1M11.8 11.8l1 1M3.2 12.8l1-1M11.8 4.2l1-1" ${S} stroke-width="1.3" ${SL}/>`,
  moon: `<path d="M10 2a6 6 0 10-.5 12A5.5 5.5 0 0110 2z" ${S} stroke-width="1.3" ${SL}/>`,
  globe: `<circle cx="8" cy="8" r="6" ${S} ${SW}/><path d="M2.5 8h11M8 2c1.8 2 2.7 4 2.7 6s-.9 4-2.7 6c-1.8-2-2.7-4-2.7-6s.9-4 2.7-6z" ${S} stroke-width="1.3" ${SL}/>`,
  plus: `<path d="M8 3v10M3 8h10" ${S} stroke-width="1.6" ${SL}/>`,
  minus: `<path d="M3 8h10" ${S} stroke-width="1.6" ${SL}/>`,
  x: `<path d="M3.5 3.5l9 9M12.5 3.5l-9 9" ${S} stroke-width="1.6" ${SL}/>`,
  check: `<path d="M3 8l3.5 3.5L13 5" ${S} stroke-width="1.6" ${SL}/>`,
  edit: `<path d="M3 13h3l7-7-3-3-7 7v3z" ${S} ${SW} ${SL}/><path d="M9 4l3 3" ${S} ${SW} ${SL}/>`,
  trash: `<path d="M3 4.5h10M6 4.5V3a1 1 0 011-1h2a1 1 0 011 1v1.5M4.5 4.5v8.5a1 1 0 001 1h5a1 1 0 001-1V4.5M7 7v5M9 7v5" ${S} ${SW} ${SL}/>`,
  'chevron-left': `<path d="M10 3L5 8l5 5" ${S} stroke-width="1.6" ${SL}/>`,
  'chevron-right': `<path d="M6 3l5 5-5 5" ${S} stroke-width="1.6" ${SL}/>`,
  'chevron-up': `<path d="M3 10l5-5 5 5" ${S} stroke-width="1.6" ${SL}/>`,
  'chevron-down': `<path d="M3 6l5 5 5-5" ${S} stroke-width="1.6" ${SL}/>`,
  'arrow-left': `<path d="M13 8H3M6 4L3 8l3 4" ${S} stroke-width="1.6" ${SL}/>`,
  'arrow-right': `<path d="M3 8h10M10 4l3 4-3 4" ${S} stroke-width="1.6" ${SL}/>`,
  'arrow-up': `<path d="M8 13V3M4 6l4-3 4 3" ${S} stroke-width="1.6" ${SL}/>`,
  'arrow-down': `<path d="M8 3v10M4 10l4 3 4-3" ${S} stroke-width="1.6" ${SL}/>`,
  bell: `<path d="M4 6.5a4 4 0 018 0V9l1 2.5H3L4 9V6.5z" ${S} ${SW} ${SL}/><path d="M6.5 13a1.5 1.5 0 003 0" ${S} ${SW} ${SL}/>`,
  clock: `<circle cx="8" cy="8" r="5.5" ${S} ${SW}/><path d="M8 5v3l2 1.5" ${S} ${SW} ${SL}/>`,
  timer: `<circle cx="8" cy="9" r="4.5" ${S} ${SW}/><path d="M8 6v3M6 2h4M7.5 2v2h1V2" ${S} ${SW} ${SL}/>`,
  calendar: `<rect x="2.5" y="3.5" width="11" height="10" rx="1" ${S} ${SW}/><path d="M5 2v3M11 2v3M2.5 6.5h11" ${S} ${SW} ${SL}/>`,
  flame: `<path d="M8 14c2.5 0 4.5-1.8 4.5-4.5 0-2-1.5-3.5-2.5-4.5.5 1.5 0 3-1 3.5.5-2-1-4.5-3-6-.5 3-3 4.5-3 7C3 12.2 5.2 14 8 14z" ${S} ${SW} ${SL}/>`,
  trophy: `<path d="M5 3h6v3a3 3 0 01-6 0V3z" ${S} ${SW} ${SL}/><path d="M5 4H3v1a2 2 0 002 2M11 4h2v1a2 2 0 01-2 2M6 12h4M8 9v3M5.5 13.5h5" ${S} ${SW} ${SL}/>`,
  scale: `<path d="M2.5 5.5h11L11 12.5H5L2.5 5.5z" ${S} ${SW} ${SL}/><path d="M8 5.5V3.5" ${S} ${SW} ${SL}/><circle cx="8" cy="3" r="1" ${S} ${SW}/>`,
  logout: `<path d="M9 3H4a1 1 0 00-1 1v8a1 1 0 001 1h5" ${S} ${SW} ${SL}/><path d="M11 5l3 3-3 3M6 8h8" ${S} ${SW} ${SL}/>`,
  save: `<path d="M3 3h8l2 2v8H3V3z" ${S} ${SW} ${SL}/><path d="M5 3v3h6V3M5 9h6v4H5V9z" ${S} ${SW} ${SL}/>`,
  external: `<path d="M6 3H3v10h10v-3M9 3h4v4M8 8l5-5" ${S} ${SW} ${SL}/>`,
  menu: `<path d="M2.5 4h11M2.5 8h11M2.5 12h11" ${S} stroke-width="1.6" ${SL}/>`,
  logo: `<path d="M3 8h3l2-5 2 9 2-4h1" stroke="#fff" stroke-width="1.8" ${SL}/>`,
};
