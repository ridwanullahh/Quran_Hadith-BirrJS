/**
 * Hadith data service — full 16-collection dataset extracted via BirrDB.
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Source: 134MB SQLite database from the `hadith` npm package.
 * Extracted by scripts/extract-all-hadith.cjs into:
 *   - src/data/hadith-full/collections.json   (metadata index, build-time import)
 *   - public/hadith-full/<key>.json.gz         (gzip-compressed BirrDB columnar JSON)
 *
 * 50,508 hadiths across 16 collections, compressed from 134MB → 13.2MB (gzip).
 * Each collection is lazy-loaded on demand: the .json.gz is fetched at runtime,
 * decompressed with DecompressionStream, and the BirrDB columnar columns are
 * deserialized back into row objects.
 *
 * BirrDB columnar compression (per collection):
 *   - number / bookId / narrator / grade → dictionary (low cardinality)
 *   - urn / arabic / english / chapterId → plain (unique values)
 */

import collectionsMeta from './hadith-full/collections.json';
import { deserializeColumn } from 'birrstack-db';

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

export interface BookMeta {
  id: number;
  number: number;
  title: string;
  titleEn: string;
}

export interface CollectionMeta {
  id: number;
  key: string;
  name: string;
  arabicName: string;
  title: string;
  titleEn: string;
  description: string;
  status: string;
  hadithCount: number;
  bookCount: number;
  books: BookMeta[];
}

interface CollectionsIndex {
  collections: CollectionMeta[];
  totalHadiths: number;
  version: number;
}

const INDEX = collectionsMeta as CollectionsIndex;
export const COLLECTIONS: CollectionMeta[] = INDEX.collections;
export const TOTAL_HADITHS: number = INDEX.totalHadiths;

// Cache of decoded collections (key → rows)
const hadithCache = new Map<string, HadithData[]>();

/** Get all collections metadata. */
export function getCollections(): CollectionMeta[] {
  return COLLECTIONS;
}

/** Get a single collection by key. */
export function getCollection(collectionKey: string): CollectionMeta | undefined {
  return COLLECTIONS.find(c => c.key === collectionKey);
}

/** Get the real hadith count for a collection (from metadata, no loading). */
export function getCollectionCount(collectionKey: string): number {
  return getCollection(collectionKey)?.hadithCount ?? 0;
}

/** Resolve a book's display title for a collection (or null). */
export function getBookName(collectionKey: string, bookId: number): string | null {
  const col = getCollection(collectionKey);
  if (!col) return null;
  const book = col.books.find(b => b.id === bookId);
  return book ? (book.titleEn || book.title || null) : null;
}

/**
 * Decompress a gzip-compressed Blob/Response into a UTF-8 string using the
 * browser's DecompressionStream (supported in all modern browsers).
 */
async function decompressGzip(response: Response): Promise<string> {
  if (typeof DecompressionStream === 'undefined') {
    // Fallback: should not happen in modern browsers, but guard anyway.
    throw new Error('DecompressionStream is not supported in this environment.');
  }
  const ds = new DecompressionStream('gzip');
  const decompressed = response.body!.pipeThrough(ds);
  return await new Response(decompressed).text();
}

/**
 * Deserialize a BirrDB columnar-serialized collection into row objects.
 */
function deserializeCollection(serialized: {
  data: Array<{ name: string; compression: string; data: unknown; dictionary?: unknown[] }>;
  length: number;
}): HadithData[] {
  const columns: Record<string, unknown[]> = {};
  for (const scol of serialized.data) {
    columns[scol.name] = deserializeColumn(scol as never);
  }
  const out: HadithData[] = [];
  const n = serialized.length;
  for (let i = 0; i < n; i++) {
    out.push({
      urn: String(columns.urn?.[i] ?? ''),
      number: Number(columns.number?.[i] ?? 0),
      arabic: String(columns.arabic?.[i] ?? ''),
      english: String(columns.english?.[i] ?? ''),
      narrator: String(columns.narrator?.[i] ?? ''),
      grade: String(columns.grade?.[i] ?? ''),
      bookId: Number(columns.bookId?.[i] ?? 0),
      chapterId: Number(columns.chapterId?.[i] ?? 0),
    });
  }
  return out;
}

/** Get hadiths for a collection (lazy-loaded + cached). */
export async function getHadiths(collectionKey: string): Promise<HadithData[]> {
  const cached = hadithCache.get(collectionKey);
  if (cached) return cached;

  const col = getCollection(collectionKey);
  if (!col || col.hadithCount === 0) return [];

  try {
    // Build the fetch URL relative to the app root, not the current page.
      // When deployed to a subdirectory (e.g. /Quran_Hadith-BirrJS/), we need
      // to resolve from the base path, not from the current route.
      const basePath = (typeof window !== 'undefined' && window.location.pathname)
        ? window.location.pathname.replace(/\/[^\/]*$/, '/')
        : '/';
      const resp = await fetch(`${basePath}hadith-full/${collectionKey}.json.gz`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await decompressGzip(resp);
    const serialized = JSON.parse(text);
    const rows = deserializeCollection(serialized);
    hadithCache.set(collectionKey, rows);
    return rows;
  } catch (err) {
    console.error(`Hadith load failed for ${collectionKey}:`, err);
    return [];
  }
}

/** Search across hadith collections (loads each lazily, caps results). */
export async function searchHadiths(
  query: string,
  limit = 50,
): Promise<Array<{ collection: string; hadith: HadithData }>> {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results: Array<{ collection: string; hadith: HadithData }> = [];

  for (const col of COLLECTIONS) {
    if (col.hadithCount === 0) continue;
    const hadiths = await getHadiths(col.key);
    for (const h of hadiths) {
      if (
        h.english.toLowerCase().includes(q) ||
        h.arabic.includes(query) ||
        h.narrator.toLowerCase().includes(q) ||
        h.grade.toLowerCase().includes(q)
      ) {
        results.push({ collection: col.key, hadith: h });
        if (results.length >= limit) return results;
      }
    }
  }
  return results;
}

/** Get a random hadith (for the daily hadith feature). */
export async function getRandomHadith(): Promise<{ collection: string; hadith: HadithData }> {
  // Pick from collections that actually have hadiths.
  const nonEmpty = COLLECTIONS.filter(c => c.hadithCount > 0);
  const col = nonEmpty[Math.floor(Math.random() * nonEmpty.length)]!;
  const hadiths = await getHadiths(col.key);
  const hadith = hadiths[Math.floor(Math.random() * hadiths.length)]!;
  return { collection: col.key, hadith };
}
