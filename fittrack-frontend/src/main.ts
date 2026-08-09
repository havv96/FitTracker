// `@angular/localize/init` is loaded as a polyfill via angular.json.
import { loadTranslations } from '@angular/localize';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Pre-paint theme + locale resolution. This block runs before Angular bootstraps,
// so setting `data-theme` and `lang` on <html> here avoids FOUC. It stays here in
// main.ts (same-origin hashed JS) because nginx CSP `script-src 'self'` forbids
// inline scripts in index.html.
async function boot(): Promise<void> {
  const storedTheme = safeGet('ftp-theme');
  const theme =
    storedTheme === 'dark' || storedTheme === 'light'
      ? storedTheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  document.documentElement.setAttribute('data-theme', theme);

  const storedLocale = safeGet('ftp-locale');
  const locale = storedLocale === 'bg' ? 'bg' : 'en';
  document.documentElement.setAttribute('lang', locale);

  if (locale === 'bg') {
    try {
      const dict = await fetch('/locale/messages.bg.json', { cache: 'no-cache' }).then((r) =>
        r.ok ? (r.json() as Promise<Record<string, string>>) : ({} as Record<string, string>),
      );
      loadTranslations(dict);
    } catch {
      /* dictionary unavailable — fall through with source strings */
    }
  }

  await bootstrapApplication(App, appConfig);
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

boot().catch((err) => {
  console.error(err);
});
