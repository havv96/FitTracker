import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { FtTone } from './ft-stat-card.component';

@Component({
  selector: 'ft-progress-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="track" [style.height.px]="height()">
      <div class="fill" [class]="'tone-' + tone()" [style.width.%]="clamped()"></div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .track {
        background: var(--border);
        border-radius: 999px;
        overflow: hidden;
      }
      .fill {
        height: 100%;
        background: var(--accent);
        transition: width 0.25s ease;
      }
      .fill.tone-success {
        background: var(--success);
      }
      .fill.tone-warn {
        background: var(--warn);
      }
      .fill.tone-danger {
        background: var(--danger);
      }
      .fill.tone-muted {
        background: var(--muted);
      }
    `,
  ],
})
export class FtProgressBarComponent {
  readonly value = input.required<number>();
  readonly height = input<number>(6);
  readonly tone = input<FtTone>('accent');

  readonly clamped = computed(() => Math.max(0, Math.min(100, this.value())));
}
