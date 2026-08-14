/**
 * Hadith data service — uses extracted JSON data from the `hadith` npm package.
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * 6 major collections, 200 hadiths each (1200 total), fully offline.
 * Collections are lazy-loaded on demand to keep initial bundle small.
 */

import collectionsMeta from './hadith-extracted/collections.json';

export interface HadithData {
  urn: string;
  number: number;
  arabic: string;
  english: string;
  narrator: string;
  grade: string;
  bookId: number;
  chapterId: number;
}

export interface CollectionMeta {
  id: number;
  key: string;
  name: string;
  arabicName: string;
  title: string;
  titleEn: string;
  description: string;
}

export const COLLECTIONS: CollectionMeta[] = collectionsMeta as CollectionMeta[];

// Cache for loaded collections
const hadithCache = new Map<string, HadithData[]>();

/** Get all collections metadata. */
export function getCollections(): CollectionMeta[] {
  return COLLECTIONS;
}

/** Get hadiths for a collection (lazy-loaded). */
export async function getHadiths(collectionKey: string): Promise<HadithData[]> {
  if (hadithCache.has(collectionKey)) {
    return hadithCache.get(collectionKey)!;
  }
  try {
    const data = await import(`./hadith-extracted/${collectionKey}.json`);
    const hadiths = (data.default || data) as HadithData[];
    hadithCache.set(collectionKey, hadiths);
    return hadiths;
  } catch {
    return [];
  }
}

/** Get count for a collection (from metadata, no loading needed). */
export function getCollectionCount(collectionKey: string): number {
  return 200; // Each collection has 200 hadiths extracted
}

/** Search across all hadith collections (loads all collections). */
export async function searchHadiths(query: string): Promise<Array<{ collection: string; hadith: HadithData }>> {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results: Array<{ collection: string; hadith: HadithData }> = [];

  for (const col of COLLECTIONS) {
    const hadiths = await getHadiths(col.key);
    for (const h of hadiths) {
      if (
        h.english.toLowerCase().includes(q) ||
        h.arabic.includes(query) ||
        h.narrator.toLowerCase().includes(q)
      ) {
        results.push({ collection: col.key, hadith: h });
        if (results.length >= 50) return results;
      }
    }
  }
  return results;
}

/** Get a random hadith (for daily hadith feature). */
export async function getRandomHadith(): Promise<{ collection: string; hadith: HadithData }> {
  const col = COLLECTIONS[Math.floor(Math.random() * COLLECTIONS.length)]!;
  const hadiths = await getHadiths(col.key);
  const hadith = hadiths[Math.floor(Math.random() * hadiths.length)]!;
  return { collection: col.key, hadith };
}
