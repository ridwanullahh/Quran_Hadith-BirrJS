/**
 * BirrDB setup for the Quran & Hadith app.
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Collections: bookmarks, readingProgress, settings.
 */

import { BirrDB } from 'birrstack-db';

let dbInstance: BirrDB | null = null;

export async function getDB(): Promise<BirrDB> {
  if (dbInstance) return dbInstance;
  dbInstance = await BirrDB.open('quran-hadith-app', { autoPersist: true });

  dbInstance.collection('bookmarks', {
    columns: [
      { name: 'type', type: 'string' },          // 'ayah' | 'hadith'
      { name: 'surahNumber', type: 'number', nullable: true },
      { name: 'ayahNumber', type: 'number', nullable: true },
      { name: 'hadithId', type: 'string', nullable: true },
      { name: 'label', type: 'string' },
      { name: 'createdAt', type: 'number' },
    ],
  });

  dbInstance.collection('readingProgress', {
    columns: [
      { name: 'surahNumber', type: 'number' },
      { name: 'lastAyah', type: 'number' },
      { name: 'lastReadAt', type: 'number' },
    ],
  });

  dbInstance.collection('settings', {
    columns: [
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
  });

  return dbInstance;
}

export interface Bookmark {
  id?: number;
  type: 'ayah' | 'hadith';
  surahNumber?: number;
  ayahNumber?: number;
  hadithId?: string;
  label: string;
  createdAt: number;
}

export async function addBookmark(bm: Omit<Bookmark, 'id' | 'createdAt'>): Promise<number> {
  const db = await getDB();
  const col = db.getCollection('bookmarks');
  return col.insert({ ...bm, createdAt: Date.now() });
}

export async function removeBookmark(id: number): Promise<void> {
  const db = await getDB();
  db.getCollection('bookmarks').delete(id);
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const db = await getDB();
  return db.query<Bookmark>('bookmarks', { orderBy: 'createdAt', orderDir: 'desc' });
}

export async function isBookmarked(type: string, surahNumber?: number, ayahNumber?: number, hadithId?: string): Promise<boolean> {
  const db = await getDB();
  const matches = db.query<Bookmark>('bookmarks', {
    where: [
      { field: 'type', op: 'eq', value: type },
      ...(surahNumber !== undefined ? [{ field: 'surahNumber', op: 'eq', value: surahNumber } as const] : []),
      ...(ayahNumber !== undefined ? [{ field: 'ayahNumber', op: 'eq', value: ayahNumber } as const] : []),
      ...(hadithId !== undefined ? [{ field: 'hadithId', op: 'eq', value: hadithId } as const] : []),
    ],
  });
  return matches.length > 0;
}

export async function saveProgress(surahNumber: number, lastAyah: number): Promise<void> {
  const db = await getDB();
  const col = db.getCollection('readingProgress');
  const existing = db.query<{ id: number }>('readingProgress', { where: { surahNumber } });
  if (existing.length > 0 && existing[0]) {
    col.update(existing[0].id, { lastAyah, lastReadAt: Date.now() });
  } else {
    col.insert({ surahNumber, lastAyah, lastReadAt: Date.now() });
  }
}

export async function getProgress(surahNumber: number): Promise<number> {
  const db = await getDB();
  const rows = db.query<{ lastAyah: number }>('readingProgress', { where: { surahNumber } });
  return rows[0]?.lastAyah ?? 0;
}
