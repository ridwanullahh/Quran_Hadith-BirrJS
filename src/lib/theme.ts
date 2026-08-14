/**
 * Theme management — light/dark mode with persistence.
 * BismiLLAH Ar-Rahman Ar-Raheem.
 */

import { signal, type Signal } from 'birrstack-core';

export type Theme = 'light' | 'dark';

const themeSignal: Signal<Theme> = signal<Theme>('light');

export function getThemeSignal(): Signal<Theme> {
  return themeSignal;
}

export function getTheme(): Theme {
  return themeSignal.value;
}

export function setTheme(theme: Theme): void {
  themeSignal.value = theme;
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
  // Persist to localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('birr-theme', theme);
  }
}

export function toggleTheme(): void {
  setTheme(themeSignal.value === 'light' ? 'dark' : 'light');
}

export function initTheme(): void {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('birr-theme') as Theme | null;
    if (saved) {
      setTheme(saved);
      return;
    }
  }
  // Default to light
  setTheme('light');
}
