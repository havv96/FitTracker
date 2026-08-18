import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ft-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (title(); as t) {
      <header class="panel-header">
        <div class="panel-title">{{ t }}</div>
        <div class="panel-actions"><ng-content select="[card-actions]" /></div>
      </header>
    }
    <div [class.panel-body]="padded()">
      <ng-content />
    </div>
  `,
  host: {
    '[class]': `"ft-card" + (interactive() ? " interactive" : "") + (tone() ? " tone-" + tone() : "")`,
  },
  styles: [
    `
      :host {
        display: block;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        overflow: hidden;
        transition: border-color 0.12s ease;
      }
      :host.interactive {
        cursor: pointer;
      }
      :host.interactive:hover {
        border-color: var(--accent);
      }
      :host.tone-accent {
        background: var(--accent-dim);
        border-color: var(--accent);
      }
      .panel-header {
        padding: 14px 18px;
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .panel-title {
        font-weight: 700;
        font-size: 14px;
        letter-spacing: -0.01em;
      }
      .panel-actions:empty {
        display: none;
      }
      .panel-body {
        padding: 16px 18px;
      }
    `,
  ],
})
export class FtCardComponent {
  readonly title = input<string | null>(null);
  readonly padded = input<boolean>(true);
  readonly interactive = input<boolean>(false);
  readonly tone = input<'accent' | null>(null);
}
