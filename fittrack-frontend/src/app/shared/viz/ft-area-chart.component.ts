import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface ChartPoint {
  x: number; // 0..1 normalized
  y: number; // 0..1 normalized (0 = bottom, 1 = top)
  label?: string;
}

const W = 500;
const H = 100;

@Component({
  selector: 'ft-area-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      class="chart"
      [attr.viewBox]="'0 0 ' + width + ' ' + height"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient [attr.id]="gradientId()" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" [attr.stop-color]="strokeVar()" stop-opacity="0.18" />
          <stop offset="100%" [attr.stop-color]="strokeVar()" stop-opacity="0" />
        </linearGradient>
      </defs>
      @if (areaPath()) {
        <path [attr.d]="areaPath()" [attr.fill]="'url(#' + gradientId() + ')'" />
      }
      @if (linePath()) {
        <path
          [attr.d]="linePath()"
          [attr.stroke]="strokeVar()"
          stroke-width="2"
          fill="none"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
      }
      @if (lastPoint(); as p) {
        <circle
          [attr.cx]="p.cx"
          [attr.cy]="p.cy"
          r="3"
          [attr.fill]="strokeVar()"
          stroke="var(--surface)"
          stroke-width="1.5"
        />
      }
    </svg>
    @if (lastLabel(); as l) {
      <div class="tag" [style.left.px]="tagLeft()">{{ l }}</div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: 120px;
      }
      .chart {
        width: 100%;
        height: 100%;
        display: block;
      }
      .tag {
        position: absolute;
        top: 4px;
        transform: translateX(-100%);
        padding: 2px 8px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 4px;
        font-family: var(--mono);
        font-size: 11px;
        font-weight: 700;
        color: var(--fg);
      }
    `,
  ],
})
export class FtAreaChartComponent {
  readonly points = input.required<ChartPoint[]>();
  readonly tone = input<'accent' | 'success' | 'warn' | 'danger'>('accent');
  readonly lastLabel = input<string | null>(null);

  readonly width = W;
  readonly height = H;
  readonly gradientId = computed(() => `grad-${Math.round(Math.random() * 1e6)}`);
  readonly strokeVar = computed(() => `var(--${this.tone()})`);

  readonly transformed = computed(() =>
    this.points().map((p) => ({
      cx: p.x * W,
      cy: H - p.y * (H - 8) - 4,
    })),
  );

  readonly linePath = computed(() => {
    const pts = this.transformed();
    if (pts.length < 2) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx.toFixed(1)},${p.cy.toFixed(1)}`).join(' ');
  });

  readonly areaPath = computed(() => {
    const line = this.linePath();
    if (!line) return '';
    const pts = this.transformed();
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `${line} L${last.cx.toFixed(1)},${H} L${first.cx.toFixed(1)},${H} Z`;
  });

  readonly lastPoint = computed(() => {
    const pts = this.transformed();
    return pts.length ? pts[pts.length - 1] : null;
  });

  readonly tagLeft = computed(() => {
    const p = this.lastPoint();
    if (!p) return 0;
    return (p.cx / W) * 100;
  });
}
