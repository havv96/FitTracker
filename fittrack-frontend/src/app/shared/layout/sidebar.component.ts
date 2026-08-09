import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LocaleService } from '../../core/services/locale.service';
import { ThemeService } from '../../core/services/theme.service';
import { FtIconComponent } from '../ui/ft-icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, UpperCasePipe, RouterLink, RouterLinkActive, FtIconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly locale = inject(LocaleService);

  readonly currentUser$ = this.auth.currentUser$;

  emailInitials(email: string | null | undefined): string {
    if (!email) return 'FT';
    const [local] = email.split('@');
    return (local?.slice(0, 2) ?? 'FT').toUpperCase();
  }

  logout(): void {
    this.auth.logout();
  }
}
