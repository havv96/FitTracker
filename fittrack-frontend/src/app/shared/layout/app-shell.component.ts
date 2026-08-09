import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell">
      <app-sidebar [open]="menuOpen()" />
      <button
        type="button"
        class="backdrop"
        [class.is-open]="menuOpen()"
        [attr.aria-hidden]="!menuOpen()"
        [attr.tabindex]="menuOpen() ? 0 : -1"
        (click)="closeMenu()"
        i18n-aria-label="@@shell.closeMenuAria"
        aria-label="Close navigation"
      ></button>
      <main class="main">
        <app-topbar [menuOpen]="menuOpen()" (menuToggle)="toggleMenu()" />
        <div class="content">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  host: {
    '(document:keydown.escape)': 'closeMenu()',
  },
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
