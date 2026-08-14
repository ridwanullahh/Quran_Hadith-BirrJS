/**
 * Quran & Hadith app — main entry point.
 * BismiLLAH Ar-Rahman Ar-Raheem.
 */

import { mount } from 'birrstack-core';
import { initTheme } from './lib/theme';
import App from './App.birr';

initTheme();
const host = document.getElementById('app')!;
mount(App, host);
