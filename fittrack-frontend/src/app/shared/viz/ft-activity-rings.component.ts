import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface Ring {
  value: number;
  max: number;
  tone: 'accent' | 'success' | 'warn' | 'danger';
  label?: string;
}

const RADII = [45, 33, 21];
const STROKES = [9, 8, 7];

@Component({
  selector: 'ft-activity-rings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 110 110" aria-hidden="true">
      @for (r of tracks(); track $index) {
        <circle
          cx="55"
          cy="55"
          [attr.r]="r.radius"
          fill="none"
          stroke="var(--border)"
          [attr.stroke-width]="r.stroke"
        />
        <circle
          cx="55"
          cy="55"
          [attr.r]="r.radius"
          fill="none"
          [attr.stroke]="r.color"
          [attr.stroke-width]="r.stroke"
          [attr.stroke-dasharray]="r.dashArray"
          [attr.stroke-dashoffset]="r.dashOffset"
          stroke-linecap="round"
          transform="rotate(-90 55 55)"
        />
      }
      @if (centerValue()) {
        <text x="55" y="59" text-anchor="middle" class="center-value">{{ centerValue() }}</text>
      }
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .center-value {
        font-family: var(--mono);
        font-weight: 700;
        font-size: 16px;
        fill: var(--fg);
      }
    `,
  ],
})
export class FtActivityRingsComponent {
  readonly rings = input.required<Ring[]>();
  readonly size = input<number>(120);
  readonly centerValue = input<string | null>(null);

  readonly tracks = computed(() => {
    const arr = this.rings().slice(0, 3);
    return arr.map((ring, i) => {
      const radius = RADII[i];
      const stroke = STROKES[i];
      const circumference = 2 * Math.PI * radius;
      const pct = ring.max > 0 ? Math.min(1, Math.max(0, ring.value / ring.max)) : 0;
      return {
        radius,
        stroke,
        color: `var(--${ring.tone})`,
        dashArray: circumference.toFixed(2),
        dashOffset: (circumference * (1 - pct)).toFixed(2),
      };
    });
  });
}
