/**
 * Quran & Hadith app — main entry point.
 * BismiLLAH Ar-Rahman Ar-Raheem.
 */

import { mount, createRouter, registerRouter, signal } from 'birrstack-core';
import { initTheme } from './lib/theme';
import App from './App.birr';

// Initialize theme
initTheme();

// Create router
const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', name: 'home' },
    { path: '/quran', name: 'quran-list' },
    { path: '/quran/:number', name: 'surah' },
    { path: '/hadith', name: 'hadith-list' },
    { path: '/hadith/:collection', name: 'hadith-collection' },
    { path: '/search', name: 'search' },
    { path: '/bookmarks', name: 'bookmarks' },
  ],
});
registerRouter(router);

// Current route signal (shared with components)
export const currentRoute = signal<{ name: string; params: Record<string, string> }>({
  name: 'home',
  params: {},
});

router.subscribe(to => {
  if (to) {
    currentRoute.value = { name: to.name ?? 'home', params: to.params };
  }
});

// Mount the app
const host = document.getElementById('app')!;
mount(App, host);
