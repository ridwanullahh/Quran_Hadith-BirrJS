#!/usr/bin/env node
/**
 * extract-all-hadith.cjs
 *
 * Full Hadith Data Extraction into BirrDB.
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Reads ALL hadiths from ALL 16 collections in the `hadith` npm package's
 * 134MB SQLite database and writes them to src/data/hadith-full/ as
 * BirrDB columnar-compressed JSON files (one per collection).
 *
 * Compression strategy (BirrDB columnar engine):
 *   - number   → delta (monotonic) or dictionary
 *   - bookId   → dictionary (low cardinality: ~dozens of books)
 *   - chapterId→ dictionary (low cardinality)
 *   - narrator → dictionary (highly repetitive prefixes)
 *   - grade    → dictionary (very low cardinality: Sahih, Hasan, ...)
 *   - arabic   → plain (unique text — stored once)
 *   - english  → plain (unique text — stored once)
 *
 * Output: minified JSON per collection, lazy-loaded by hadith-service.ts.
 */
'use strict';

const { writeFileSync, mkdirSync, existsSync, statSync } = require('node:fs');
const { join } = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { gzipSync } = require('node:zlib');

const ROOT = join(__dirname, '..');
const DB_PATH = join(ROOT, 'node_modules', 'hadith', 'data', 'hadith.db');
// Metadata index (small, build-time imported) lives in src/data/hadith-full/.
// The gzip-compressed columnar JSON (bulk data, runtime-fetched) lives in
// public/hadith-full/ so Vite serves it as a static asset.
const META_DIR = join(ROOT, 'src', 'data', 'hadith-full');
const PUBLIC_DIR = join(ROOT, 'public', 'hadith-full');

if (!existsSync(DB_PATH)) {
  console.error(`Hadith DB not found at ${DB_PATH}`);
  console.error('Run: npm install hadith');
  process.exit(1);
}
mkdirSync(META_DIR, { recursive: true });
mkdirSync(PUBLIC_DIR, { recursive: true });

// ---- 16 collections (keys are URL-safe slugs) ----
const COLLECTIONS = [
  { id: 1,   key: 'bukhari',     name: 'Sahih al-Bukhari',         arabicName: 'صحيح البخاري' },
  { id: 2,   key: 'muslim',      name: 'Sahih Muslim',             arabicName: 'صحيح مسلم' },
  { id: 3,   key: 'nasai',       name: 'Sunan an-Nasai',           arabicName: 'سنن النسائي' },
  { id: 10,  key: 'abudawud',    name: 'Sunan Abi Dawud',          arabicName: 'سنن أبي داود' },
  { id: 30,  key: 'tirmidhi',    name: 'Jami at-Tirmidhi',         arabicName: 'جامع الترمذي' },
  { id: 38,  key: 'ibnmajah',    name: 'Sunan Ibn Majah',          arabicName: 'سنن ابن ماجه' },
  { id: 40,  key: 'malik',       name: 'Muwatta Malik',            arabicName: 'موطأ مالك' },
  { id: 50,  key: 'ahmad',       name: 'Musnad Ahmad',             arabicName: 'مسند أحمد' },
  { id: 101, key: 'nawawi40',    name: "An-Nawawi's 40 Hadith",    arabicName: 'الأربعون النووية' },
  { id: 102, key: 'forty',       name: 'Collections of Forty',     arabicName: 'الأربعون' },
  { id: 110, key: 'riyad',       name: 'Riyad as-Salihin',         arabicName: 'رياض الصالحين' },
  { id: 113, key: 'mishkat',     name: 'Mishkat al-Masabih',       arabicName: 'مشكاة المصابيح' },
  { id: 115, key: 'adab',        name: 'Al-Adab Al-Mufrad',        arabicName: 'الأدب المفرد' },
  { id: 130, key: 'shamail',     name: 'Ash-Shama’il Al-Muhammadiyah', arabicName: 'الشمائل المحمدية' },
  { id: 200, key: 'bulugh',      name: 'Bulugh al-Maram',          arabicName: 'بلوغ المرام' },
  { id: 300, key: 'hisn',        name: 'Hisn al-Muslim',           arabicName: 'حصن المسلم' },
];

// BirrDB columnar engine — loaded via dynamic import (ESM).
let serializeColumn, deserializeColumn, Collection;
let encodeDictionary, decodeDictionary;

/**
 * Build a serialized (compressed) columnar collection for one hadith collection.
 * Uses BirrDB's serializeColumn which auto-picks dictionary/delta/rle/plain.
 */
function buildCompressedCollection(metaKey, rows) {
  const columnDefs = [
    { name: 'urn',        type: 'string' },
    { name: 'number',     type: 'number' },
    { name: 'arabic',     type: 'string' },
    { name: 'english',    type: 'string' },
    { name: 'narrator',   type: 'string' },
    { name: 'grade',      type: 'string' },
    { name: 'bookId',     type: 'number' },
    { name: 'chapterId',  type: 'number' },
  ];
  // Columnar transpose
  const colData = {
    urn:        rows.map(r => r.urn),
    number:     rows.map(r => r.number),
    arabic:     rows.map(r => r.arabic),
    english:    rows.map(r => r.english),
    narrator:   rows.map(r => r.narrator),
    grade:      rows.map(r => r.grade),
    bookId:     rows.map(r => r.bookId),
    chapterId:  rows.map(r => r.chapterId),
  };
  const data = columnDefs.map(c => serializeColumn(c.name, c.type, colData[c.name]));
  return {
    name: metaKey,
    columns: columnDefs,
    data,
    length: rows.length,
    version: 1,
    __note: 'BirrDB columnar-compressed. Use deserializeColumn on each entry in .data to recover values.',
  };
}

function clean(s) {
  if (!s) return '';
  return String(s).trim();
}

function main() {
  console.log('BismiLLAH Ar-Rahman Ar-Raheem. Extracting ALL hadiths from 16 collections...');
  const t0 = Date.now();

  const db = new DatabaseSync(DB_PATH, { readOnly: true });

  // --- Collection metadata ---
  const collectionRows = db.prepare(`
    SELECT id, title, title_en, short_description, short_description_en, status
    FROM collection ORDER BY id
  `).all();
  const collectionMetaById = new Map(collectionRows.map(c => [c.id, c]));

  // --- Books metadata (for UI resolution) ---
  const booksByCollection = new Map();
  for (const col of COLLECTIONS) {
    const books = db.prepare(`
      SELECT id, display_number, order_in_collection, title, title_en
      FROM book WHERE collection_id = ? ORDER BY order_in_collection
    `).all(col.id);
    booksByCollection.set(col.id, books.map(b => ({
      id: b.id,
      number: b.display_number,
      title: clean(b.title),
      titleEn: clean(b.title_en),
    })));
  }

  const collectionsIndex = [];
  let totalHadiths = 0;
  let totalRawBytes = 0;
  let totalCompressedBytes = 0;
  let totalColumnarBytes = 0;

  for (const col of COLLECTIONS) {
    const meta = collectionMetaById.get(col.id) || {};
    const tCol = Date.now();

    // --- Arabic hadiths (hadith_content) ---
    // c0=urn, c1=collection_id, c2=book_id, c3=display_number, c4=order_in_book,
    // c5=chapter_id, c6=narrator_prefix, c7=content, c8=narrator_postfix,
    // c13=grades, c14=narrators
    const arStmt = db.prepare(`
      SELECT c0 AS urn, c2 AS book_id, c3 AS display_number, c4 AS order_in_book,
             c5 AS chapter_id, c6 AS narrator_prefix, c7 AS content,
             c8 AS narrator_postfix, c13 AS grades, c14 AS narrators
      FROM hadith_content WHERE c1 = ? ORDER BY c4
    `);
    const arabic = arStmt.all(col.id);

    // --- English hadiths (hadith_en_content) ---
    // c0=arabic_urn, c1=urn, c2=collection_id, c3=narrator_prefix,
    // c4=content, c5=narrator_postfix, c7=grades, c8=reference
    const enStmt = db.prepare(`
      SELECT c0 AS arabic_urn, c3 AS narrator_prefix, c4 AS content,
             c5 AS narrator_postfix, c7 AS grades
      FROM hadith_en_content WHERE c2 = ?
    `);
    const english = enStmt.all(col.id);
    const englishByUrn = new Map();
    for (const e of english) {
      englishByUrn.set(String(e.arabic_urn), e);
    }

    // --- Merge arabic + english by URN ---
    const rows = [];
    for (let i = 0; i < arabic.length; i++) {
      const a = arabic[i];
      const urn = String(a.urn);
      const e = englishByUrn.get(urn) || {};
      const number = (a.display_number != null && a.display_number !== '')
        ? Number(a.display_number)
        : (a.order_in_book != null ? Number(a.order_in_book) : (i + 1));
      const arabicText = clean(
        (a.narrator_prefix || '') + ' ' + (a.content || '') + ' ' + (a.narrator_postfix || '')
      );
      const englishText = clean(
        (e.narrator_prefix || '') + ' ' + (e.content || '') + ' ' + (e.narrator_postfix || '')
      );
      rows.push({
        urn,
        number,
        arabic: arabicText,
        english: englishText,
        narrator: clean(e.narrator_prefix || a.narrator_prefix || a.narrators || ''),
        grade: clean(a.grades || e.grades || ''),
        bookId: a.book_id != null ? Number(a.book_id) : 0,
        chapterId: a.chapter_id != null ? Number(a.chapter_id) : 0,
      });
    }

    // --- Compress with BirrDB columnar engine ---
    const serialized = buildCompressedCollection(col.key, rows);
    const json = JSON.stringify(serialized);
    const rawJson = JSON.stringify(rows);
    // Gzip the columnar JSON for efficient runtime transfer.
    // The browser decompresses via DecompressionStream('gzip') in hadith-service.ts.
    const gz = gzipSync(Buffer.from(json, 'utf8'), { level: 9 });
    writeFileSync(join(PUBLIC_DIR, `${col.key}.json.gz`), gz);

    const compressedBytes = gz.length;       // transferred bytes (gzip)
    const columnarBytes = Buffer.byteLength(json); // pre-gzip columnar
    const rawBytes = Buffer.byteLength(rawJson);
    totalHadiths += rows.length;
    totalRawBytes += rawBytes;
    totalCompressedBytes += compressedBytes;
    totalColumnarBytes += columnarBytes;

    collectionsIndex.push({
      id: col.id,
      key: col.key,
      name: col.name,
      arabicName: col.arabicName,
      title: clean(meta.title) || col.name,
      titleEn: clean(meta.title_en) || col.name,
      description: clean(meta.short_description_en || meta.short_description || ''),
      status: clean(meta.status) || 'complete',
      hadithCount: rows.length,
      bookCount: (booksByCollection.get(col.id) || []).length,
      books: booksByCollection.get(col.id) || [],
    });

    const dt = ((Date.now() - tCol) / 1000).toFixed(1);
    const gzKb = (compressedBytes / 1024).toFixed(0);
    const colKb = (columnarBytes / 1024).toFixed(0);
    const rawKb = (rawBytes / 1024).toFixed(0);
    console.log(`  ${col.key.padEnd(10)} ${String(rows.length).padStart(5)} hadiths | raw ${rawKb}KB → col ${colKb}KB → gz ${gzKb}KB [${dt}s]`);
  }

  db.close();

  // --- Write collections index (metadata, build-time imported) ---
  writeFileSync(
    join(META_DIR, 'collections.json'),
    JSON.stringify({ collections: collectionsIndex, totalHadiths, version: 1 }, null, 2)
  );

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const dbSizeMB = (statSync(DB_PATH).size / (1024 * 1024)).toFixed(0);
  const gzMB = (totalCompressedBytes / (1024 * 1024)).toFixed(1);
  const colMB = (totalColumnarBytes / (1024 * 1024)).toFixed(1);
  const rawMB = (totalRawBytes / (1024 * 1024)).toFixed(1);

  console.log('');
  console.log(`AlhamduliLLAH. Extracted ${totalHadiths} hadiths from ${COLLECTIONS.length} collections in ${elapsed}s.`);
  console.log(`  Source SQLite DB        : ${dbSizeMB} MB`);
  console.log(`  Row JSON (uncompressed) : ${rawMB} MB`);
  console.log(`  BirrDB columnar JSON    : ${colMB} MB  (dictionary/delta/rle on metadata)`);
  console.log(`  Gzip compressed (.gz)   : ${gzMB} MB  (served from public/hadith-full/)`);
  console.log(`  Total reduction vs DB   : ${(gzMB / dbSizeMB * 100).toFixed(0)}% of original`);
  console.log(`  Metadata index          : src/data/hadith-full/collections.json`);
}

// Load BirrDB (ESM) then run.
(async () => {
  try {
    const birrdb = await import('birrstack-db');
    serializeColumn = birrdb.serializeColumn;
    deserializeColumn = birrdb.deserializeColumn;
    Collection = birrdb.Collection;
    encodeDictionary = birrdb.encodeDictionary;
    decodeDictionary = birrdb.decodeDictionary;
    if (!serializeColumn) throw new Error('birrstack-db did not export serializeColumn');
    main();
  } catch (err) {
    console.error('Failed to load birrstack-db:', err.message);
    console.error('Ensure vendor/birrstack-db is installed (npm install).');
    process.exit(1);
  }
})();
