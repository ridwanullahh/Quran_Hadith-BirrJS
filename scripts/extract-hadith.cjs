#!/usr/bin/env node
/**
 * Extract hadith data from the `hadith` npm package's SQLite DB
 * into browser-compatible JSON files.
 * BismiLLAH Ar-Rahman Ar-Raheem.
 */
const { writeFileSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');

const OUT_DIR = join(__dirname, '..', 'src', 'data', 'hadith-extracted');
mkdirSync(OUT_DIR, { recursive: true });

const HadithDB = require('hadith');
const db = new HadithDB();

const COLLECTIONS = [
  { id: 1, key: 'bukhari', name: 'Sahih al-Bukhari', arabicName: 'صحيح البخاري' },
  { id: 2, key: 'muslim', name: 'Sahih Muslim', arabicName: 'صحيح مسلم' },
  { id: 3, key: 'nasai', name: 'Sunan an-Nasai', arabicName: 'سنن النسائي' },
  { id: 10, key: 'abudawud', name: 'Sunan Abi Dawud', arabicName: 'سنن أبي داود' },
  { id: 30, key: 'tirmidhi', name: 'Jami at-Tirmidhi', arabicName: 'جامع الترمذي' },
  { id: 38, key: 'ibnmajah', name: 'Sunan Ibn Majah', arabicName: 'سنن ابن ماجه' },
];

const HADITHS_PER_COLLECTION = 200;

async function main() {
  await db.connect();
  console.log('BismiLLAH. Extracting hadith data...');

  const allCollections = await db.getCollections();
  const collectionsMeta = COLLECTIONS.map(c => {
    const full = allCollections.find(a => a.id === c.id);
    return {
      id: c.id, key: c.key, name: c.name, arabicName: c.arabicName,
      title: full?.title || c.name, titleEn: full?.title_en || c.name,
      description: full?.short_description_en || '',
    };
  });

  writeFileSync(join(OUT_DIR, 'collections.json'), JSON.stringify(collectionsMeta, null, 2));
  console.log('  collections.json written');

  for (const col of COLLECTIONS) {
    console.log(`  Extracting ${col.name}...`);
    const ar = await db.getHadithsByCollection(col.id, { limit: HADITHS_PER_COLLECTION });
    const en = await db.getEnglishHadithsByCollection(col.id, { limit: HADITHS_PER_COLLECTION });
    const merged = ar.map((a, i) => {
      const e = en[i] || {};
      return {
        urn: a.urn, number: a.display_number || a.order_in_book || i + 1,
        arabic: ((a.narrator_prefix || '') + ' ' + (a.content || '') + ' ' + (a.narrator_postfix || '')).trim(),
        english: ((e.narrator_prefix || '') + ' ' + (e.content || '')).trim(),
        narrator: e.narrator_prefix || a.narrator_prefix || '',
        grade: a.grades || '', bookId: a.book_id, chapterId: a.chapter_id,
      };
    });
    writeFileSync(join(OUT_DIR, `${col.key}.json`), JSON.stringify(merged));
    console.log(`    ${col.key}.json: ${merged.length} hadiths`);
  }
  await db.close();
  console.log('\nDone. AlhamduliLLAH.');
}

main().catch(e => { console.error(e); process.exit(1); });
