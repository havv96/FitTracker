import { Injectable, signal } from '@angular/core';

export type Locale = 'en' | 'bg';

const STORAGE_KEY = 'ftp-locale';

/**
 * `@angular/localize`'s `loadTranslations()` is one-shot at bootstrap — it cannot
 * unload or replace an active dictionary. Switching locales therefore requires
 * a full page reload; main.ts reads the persisted locale before Angular boots
 * and fetches the matching dictionary.
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly _locale = signal<Locale>(this.resolveInitial());
  readonly locale = this._locale.asReadonly();

  set(locale: Locale): void {
    if (locale === this._locale()) return;
    this._locale.set(locale);
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* localStorage unavailable — cannot persist, no reload will pick this up */
      return;
    }
    document.documentElement.setAttribute('lang', locale);
    window.location.reload();
  }

  toggle(): void {
    this.set(this._locale() === 'en' ? 'bg' : 'en');
  }

  private resolveInitial(): Locale {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'bg' || stored === 'en') return stored;
    } catch {
      /* localStorage unavailable */
    }
    return 'en';
  }
}
