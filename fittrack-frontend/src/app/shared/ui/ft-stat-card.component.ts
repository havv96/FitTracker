import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type FtTone = 'accent' | 'success' | 'warn' | 'danger' | 'muted' | 'default';

@Component({
  selector: 'ft-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="label">{{ label() }}</div>
    <div class="value-row">
      <span class="value">{{ value() ?? '—' }}</span>
      @if (unit()) {
        <span class="unit">{{ unit() }}</span>
      }
    </div>
    @if (delta(); as d) {
      <div class="delta" [class]="deltaClass()">{{ d }}</div>
    }
    @if (target(); as t) {
      <div class="target">/ {{ t }}<span class="target-unit"> {{ unit() }}</span></div>
    }
    <ng-content />
  `,
  styles: [
    `
      :host {
        display: block;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 16px 18px;
        min-width: 0;
      }
      .label {
        font-family: var(--mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--muted);
        margin-bottom: 6px;
      }
      .value-row {
        display: flex;
        align-items: baseline;
        gap: 4px;
      }
      .value {
        font-size: 26px;
        font-weight: 700;
        letter-spacing: -0.03em;
        font-family: var(--mono);
        line-height: 1;
        color: var(--fg);
      }
      .unit {
        font-size: 13px;
        font-weight: 500;
        color: var(--muted);
      }
      .delta {
        font-size: 12px;
        font-family: var(--mono);
        margin-top: 6px;
      }
      .delta.up {
        color: var(--success);
      }
      .delta.down {
        color: var(--danger);
      }
      .target {
        font-size: 12px;
        font-family: var(--mono);
        color: var(--muted);
        margin-top: 4px;
      }
    `,
  ],
})
export class FtStatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number | null | undefined>();
  readonly unit = input<string | null>(null);
  readonly delta = input<string | null>(null);
  readonly deltaDirection = input<'up' | 'down' | null>(null);
  readonly target = input<string | number | null>(null);

  readonly deltaClass = computed(() => {
    const d = this.deltaDirection();
    return d ?? '';
  });
}
