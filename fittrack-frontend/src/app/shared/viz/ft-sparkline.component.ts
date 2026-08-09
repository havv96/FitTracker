import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const W = 500;
const H = 80;

@Component({
  selector: 'ft-sparkline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.viewBox]="'0 0 ' + width + ' ' + height"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient [attr.id]="gradientId()" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" [attr.stop-color]="strokeVar()" stop-opacity="0.15" />
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
    </svg>
    @if (latestLabel(); as l) {
      <div class="value">{{ l }}</div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: 80px;
      }
      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .value {
        position: absolute;
        top: 4px;
        right: 8px;
        font-family: var(--mono);
        font-size: 11px;
        font-weight: 700;
        color: var(--fg);
      }
    `,
  ],
})
export class FtSparklineComponent {
  readonly points = input.required<number[]>();
  readonly tone = input<'accent' | 'success' | 'warn' | 'danger'>('accent');
  readonly latestLabel = input<string | null>(null);

  readonly width = W;
  readonly height = H;
  readonly gradientId = computed(() => `spark-${Math.round(Math.random() * 1e6)}`);
  readonly strokeVar = computed(() => `var(--${this.tone()})`);

  readonly normalized = computed(() => {
    const pts = this.points();
    if (!pts.length) return [];
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const range = max - min || 1;
    return pts.map((v, i) => ({
      x: pts.length === 1 ? W / 2 : (i / (pts.length - 1)) * W,
      y: H - ((v - min) / range) * (H - 8) - 4,
    }));
  });

  readonly linePath = computed(() => {
    const pts = this.normalized();
    if (pts.length < 2) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  });

  readonly areaPath = computed(() => {
    const line = this.linePath();
    if (!line) return '';
    const pts = this.normalized();
    return `${line} L${pts[pts.length - 1].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`;
  });
}
