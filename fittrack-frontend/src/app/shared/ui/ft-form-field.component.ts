import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ft-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (label()) {
      <label class="label" [attr.for]="for()">{{ label() }}</label>
    }
    <div class="input-slot">
      <ng-content />
    </div>
    @if (error(); as e) {
      <div class="error">{{ e }}</div>
    } @else if (hint(); as h) {
      <div class="hint">{{ h }}</div>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .label {
        font-family: var(--mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--muted);
      }
      .input-slot ::ng-deep input,
      .input-slot ::ng-deep select,
      .input-slot ::ng-deep textarea {
        display: block;
        width: 100%;
        padding: 9px 12px;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--surface);
        color: var(--fg);
        font-family: inherit;
        font-size: 14px;
        transition: border-color 0.12s ease, box-shadow 0.12s ease;
      }
      .input-slot ::ng-deep input:focus,
      .input-slot ::ng-deep select:focus,
      .input-slot ::ng-deep textarea:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-dim);
      }
      .input-slot ::ng-deep textarea {
        min-height: 72px;
        resize: vertical;
      }
      :host.compact .input-slot ::ng-deep input,
      :host.compact .input-slot ::ng-deep select {
        padding: 7px 10px;
        font-size: 13px;
      }
      .error {
        font-size: 12px;
        color: var(--danger);
        font-family: var(--mono);
      }
      .hint {
        font-size: 12px;
        color: var(--muted);
      }
    `,
  ],
})
export class FtFormFieldComponent {
  readonly label = input<string | null>(null);
  readonly for = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
}
