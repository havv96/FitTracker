import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

interface TitleContext {
  titleKey?: string;
  badge?: string;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly ctx = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.resolveContext()),
    ),
    { initialValue: this.resolveContext() },
  );

  readonly title = computed(() => TITLES[this.ctx().titleKey ?? ''] ?? 'FitTrack Pro');
  readonly badge = computed(() => this.ctx().badge);

  private resolveContext(): TitleContext {
    let deepest = this.route;
    while (deepest.firstChild) deepest = deepest.firstChild;
    const data = deepest.snapshot.data as { titleKey?: string; badge?: string };
    return { titleKey: data.titleKey, badge: data.badge };
  }
}

// Kept as a runtime lookup so the topbar has stable English fallbacks; components
// can extract these with $localize in later phases.
const TITLES: Record<string, string> = {
  'nav.dashboard': $localize`:@@nav.dashboard:Dashboard`,
  'nav.profile': $localize`:@@nav.profile:Profile`,
  'nav.library': $localize`:@@nav.library:Exercise Library`,
  'nav.workout': $localize`:@@nav.workout:Workout`,
  'nav.history': $localize`:@@nav.history:History`,
  'nav.nutrition': $localize`:@@nav.nutrition:Nutrition`,
  'nav.foodSearch': $localize`:@@nav.foodSearch:Search food`,
  'nav.progress': $localize`:@@nav.progress:Progress`,
};
