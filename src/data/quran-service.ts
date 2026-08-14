/**
 * Quran data service — uses quran-json npm package for full offline Quran.
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Features:
 *  - All 114 surahs with Arabic text
 *  - 10+ translations (English, Bengali, Spanish, French, Indonesian, Russian, Swedish, Turkish, Urdu, Chinese)
 *  - Transliteration
 *  - Per-ayah access
 *  - Lazy-loaded per surah (not bundled all at once)
 *  - Audio recitation URLs (streaming + offline download)
 */

// Available translations
export const TRANSLATIONS = [
  { code: 'en', name: 'English', file: 'quran_en.json' },
  { code: 'es', name: 'Spanish', file: 'quran_es.json' },
  { code: 'fr', name: 'French', file: 'quran_fr.json' },
  { code: 'id', name: 'Indonesian', file: 'quran_id.json' },
  { code: 'ru', name: 'Russian', file: 'quran_ru.json' },
  { code: 'ur', name: 'Urdu', file: 'quran_ur.json' },
  { code: 'tr', name: 'Turkish', file: 'quran_tr.json' },
  { code: 'bn', name: 'Bengali', file: 'quran_bn.json' },
  { code: 'sv', name: 'Swedish', file: 'quran_sv.json' },
  { code: 'zh', name: 'Chinese', file: 'quran_zh.json' },
] as const;

export type TranslationCode = typeof TRANSLATIONS[number]['code'];

// Audio reciters (EveryAyah CDN — free, no API key needed)
export const RECITERS = [
  { id: 'ar_alafasy', name: 'Mishary Alafasy', baseUrl: 'https://everyayah.com/data/Alafasy_128kbps' },
  { id: 'ar_husary', name: 'Mahmoud Khalil Al-Husary', baseUrl: 'https://everyayah.com/data/Husary_128kbps' },
  { id: 'ar_minshawi', name: 'Mohamed Al-Minshawi', baseUrl: 'https://everyayah.com/data/Minshawy_Murattal_128kbps' },
  { id: 'ar_sudais', name: 'Abdur-Rahman As-Sudais', baseUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps' },
  { id: 'ar_shuraim', name: 'Saud Al-Shuraim', baseUrl: 'https://everyayah.com/data/Saood_ash-Shuraym_128kbps' },
] as const;

export interface AyahData {
  number: number;           // ayah number within surah
  arabic: string;
  transliteration?: string;
  translations: Record<string, string>;
}

export interface SurahData {
  number: number;
  name: string;             // Arabic name
  transliteration: string;
  translation: string;      // English name
  type: string;             // meccan/medinan
  totalVerses: number;
  ayahs: AyahData[];
}

// Cache for loaded surahs
const surahCache = new Map<string, SurahData>();

/**
 * Load a surah with a specific translation.
 * Lazy-loaded — only fetches the data when requested.
 * Only loads the requested translation to keep bundle small.
 */
export async function loadSurah(surahNumber: number, translationCode: TranslationCode = 'en'): Promise<SurahData> {
  const cacheKey = `${surahNumber}-${translationCode}`;
  if (surahCache.has(cacheKey)) {
    return surahCache.get(cacheKey)!;
  }

  // Load the main chapter (Arabic + transliteration)
  const chapter = await import(`quran-json/dist/chapters/${surahNumber}.json`);

  // Load only the requested translation (not all 10)
  const trFile = TRANSLATIONS.find(t => t.code === translationCode)?.file || 'quran_en.json';
  let translations: Record<number, string> = {};
  try {
    const fullTranslation = await import(`quran-json/dist/${trFile}`);
    const surahTr = fullTranslation.default?.[surahNumber - 1] || fullTranslation[surahNumber - 1];
    if (surahTr?.verses) {
      for (const v of surahTr.verses) {
        translations[v.id] = v.translation;
      }
    }
  } catch {
    // Translation not available
  }

  // Also load English as fallback if a different translation was requested
  if (translationCode !== 'en') {
    try {
      const enTranslation = await import(`quran-json/dist/quran_en.json`);
      const surahEn = enTranslation.default?.[surahNumber - 1] || enTranslation[surahNumber - 1];
      if (surahEn?.verses) {
        for (const v of surahEn.verses) {
          if (!translations[v.id]) translations[v.id] = v.translation;
        }
      }
    } catch { /* ignore */ }
  }

  // Build ayah data
  const ayahs: AyahData[] = chapter.verses.map((v: { id: number; text: string; transliteration?: string }) => {
    return {
      number: v.id,
      arabic: v.text,
      transliteration: v.transliteration,
      translations: translations[v.id] ? { [translationCode]: translations[v.id], en: translations[v.id] } : {},
    };
  });

  const surah: SurahData = {
    number: chapter.id,
    name: chapter.name,
    transliteration: chapter.transliteration,
    translation: chapter.transliteration || chapter.name,
    type: chapter.type,
    totalVerses: chapter.total_verses,
    ayahs,
  };

  surahCache.set(surahNumber, surah);
  return surah;
}

/**
 * Get the audio URL for a specific ayah.
 * Format: {baseUrl}/{surah padded 3}{ayah padded 3}.mp3
 */
export function getAyahAudioUrl(surahNumber: number, ayahNumber: number, reciterId: string = 'ar_alafasy'): string {
  const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0]!;
  const s = String(surahNumber).padStart(3, '0');
  const a = String(ayahNumber).padStart(3, '0');
  return `${reciter.baseUrl}/${s}${a}.mp3`;
}

/**
 * Get the full surah audio URL (full recitation).
 */
export function getSurahAudioUrl(surahNumber: number, reciterId: string = 'ar_alafasy'): string {
  const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0]!;
  // Use QuranCentral format for full surah audio
  return `https://download.quranicaudio.com/quran/${reciter.id.replace('ar_', '')}/${String(surahNumber).padStart(3, '0')}.mp3`;
}

/** Get surah list metadata (static — doesn't require loading full text). */
export const SURAHS_META = [
  { number: 1, name: 'الفاتحة', transliteration: 'Al-Fatihah', englishName: 'Al-Fatihah', ayahs: 7, type: 'Meccan' },
  { number: 2, name: 'البقرة', transliteration: 'Al-Baqarah', englishName: 'Al-Baqarah', ayahs: 286, type: 'Medinan' },
  { number: 3, name: 'آل عمران', transliteration: 'Ali \'Imran', englishName: 'Ali \'Imran', ayahs: 200, type: 'Medinan' },
  { number: 4, name: 'النساء', transliteration: 'An-Nisa', englishName: 'An-Nisa', ayahs: 176, type: 'Medinan' },
  { number: 5, name: 'المائدة', transliteration: 'Al-Ma\'idah', englishName: 'Al-Ma\'idah', ayahs: 120, type: 'Medinan' },
  { number: 6, name: 'الأنعام', transliteration: 'Al-An\'am', englishName: 'Al-An\'am', ayahs: 165, type: 'Meccan' },
  { number: 7, name: 'الأعراف', transliteration: 'Al-A\'raf', englishName: 'Al-A\'raf', ayahs: 206, type: 'Meccan' },
  { number: 8, name: 'الأنفال', transliteration: 'Al-Anfal', englishName: 'Al-Anfal', ayahs: 75, type: 'Medinan' },
  { number: 9, name: 'التوبة', transliteration: 'At-Tawbah', englishName: 'At-Tawbah', ayahs: 129, type: 'Medinan' },
  { number: 10, name: 'يونس', transliteration: 'Yunus', englishName: 'Yunus', ayahs: 109, type: 'Meccan' },
  { number: 11, name: 'هود', transliteration: 'Hud', englishName: 'Hud', ayahs: 123, type: 'Meccan' },
  { number: 12, name: 'يوسف', transliteration: 'Yusuf', englishName: 'Yusuf', ayahs: 111, type: 'Meccan' },
  { number: 13, name: 'الرعد', transliteration: 'Ar-Ra\'d', englishName: 'Ar-Ra\'d', ayahs: 43, type: 'Medinan' },
  { number: 14, name: 'ابراهيم', transliteration: 'Ibrahim', englishName: 'Ibrahim', ayahs: 52, type: 'Meccan' },
  { number: 15, name: 'الحجر', transliteration: 'Al-Hijr', englishName: 'Al-Hijr', ayahs: 99, type: 'Meccan' },
  { number: 16, name: 'النحل', transliteration: 'An-Nahl', englishName: 'An-Nahl', ayahs: 128, type: 'Meccan' },
  { number: 17, name: 'الإسراء', transliteration: 'Al-Isra', englishName: 'Al-Isra', ayahs: 111, type: 'Meccan' },
  { number: 18, name: 'الكهف', transliteration: 'Al-Kahf', englishName: 'Al-Kahf', ayahs: 110, type: 'Meccan' },
  { number: 19, name: 'مريم', transliteration: 'Maryam', englishName: 'Maryam', ayahs: 98, type: 'Meccan' },
  { number: 20, name: 'طه', transliteration: 'Taha', englishName: 'Taha', ayahs: 135, type: 'Meccan' },
  { number: 21, name: 'الأنبياء', transliteration: 'Al-Anbya', englishName: 'Al-Anbya', ayahs: 112, type: 'Meccan' },
  { number: 22, name: 'الحج', transliteration: 'Al-Hajj', englishName: 'Al-Hajj', ayahs: 78, type: 'Medinan' },
  { number: 23, name: 'المؤمنون', transliteration: 'Al-Mu\'minun', englishName: 'Al-Mu\'minun', ayahs: 118, type: 'Meccan' },
  { number: 24, name: 'النور', transliteration: 'An-Nur', englishName: 'An-Nur', ayahs: 64, type: 'Medinan' },
  { number: 25, name: 'الفرقان', transliteration: 'Al-Furqan', englishName: 'Al-Furqan', ayahs: 77, type: 'Meccan' },
  { number: 26, name: 'الشعراء', transliteration: 'Ash-Shu\'ara', englishName: 'Ash-Shu\'ara', ayahs: 227, type: 'Meccan' },
  { number: 27, name: 'النمل', transliteration: 'An-Naml', englishName: 'An-Naml', ayahs: 93, type: 'Meccan' },
  { number: 28, name: 'القصص', transliteration: 'Al-Qasas', englishName: 'Al-Qasas', ayahs: 88, type: 'Meccan' },
  { number: 29, name: 'العنكبوت', transliteration: 'Al-\'Ankabut', englishName: 'Al-\'Ankabut', ayahs: 69, type: 'Meccan' },
  { number: 30, name: 'الروم', transliteration: 'Ar-Rum', englishName: 'Ar-Rum', ayahs: 60, type: 'Meccan' },
  { number: 31, name: 'لقمان', transliteration: 'Luqman', englishName: 'Luqman', ayahs: 34, type: 'Meccan' },
  { number: 32, name: 'السجدة', transliteration: 'As-Sajdah', englishName: 'As-Sajdah', ayahs: 30, type: 'Meccan' },
  { number: 33, name: 'الأحزاب', transliteration: 'Al-Ahzab', englishName: 'Al-Ahzab', ayahs: 73, type: 'Medinan' },
  { number: 34, name: 'سبإ', transliteration: 'Saba', englishName: 'Saba', ayahs: 54, type: 'Meccan' },
  { number: 35, name: 'فاطر', transliteration: 'Fatir', englishName: 'Fatir', ayahs: 45, type: 'Meccan' },
  { number: 36, name: 'يس', transliteration: 'Ya-Sin', englishName: 'Ya-Sin', ayahs: 83, type: 'Meccan' },
  { number: 37, name: 'الصافات', transliteration: 'As-Saffat', englishName: 'As-Saffat', ayahs: 182, type: 'Meccan' },
  { number: 38, name: 'ص', transliteration: 'Sad', englishName: 'Sad', ayahs: 88, type: 'Meccan' },
  { number: 39, name: 'الزمر', transliteration: 'Az-Zumar', englishName: 'Az-Zumar', ayahs: 75, type: 'Meccan' },
  { number: 40, name: 'غافر', transliteration: 'Ghafir', englishName: 'Ghafir', ayahs: 85, type: 'Meccan' },
  { number: 41, name: 'فصلت', transliteration: 'Fussilat', englishName: 'Fussilat', ayahs: 54, type: 'Meccan' },
  { number: 42, name: 'الشورى', transliteration: 'Ash-Shuraa', englishName: 'Ash-Shuraa', ayahs: 53, type: 'Meccan' },
  { number: 43, name: 'الزخرف', transliteration: 'Az-Zukhruf', englishName: 'Az-Zukhruf', ayahs: 89, type: 'Meccan' },
  { number: 44, name: 'الدخان', transliteration: 'Ad-Dukhan', englishName: 'Ad-Dukhan', ayahs: 59, type: 'Meccan' },
  { number: 45, name: 'الجاثية', transliteration: 'Al-Jathiyah', englishName: 'Al-Jathiyah', ayahs: 37, type: 'Meccan' },
  { number: 46, name: 'الأحقاف', transliteration: 'Al-Ahqaf', englishName: 'Al-Ahqaf', ayahs: 35, type: 'Meccan' },
  { number: 47, name: 'محمد', transliteration: 'Muhammad', englishName: 'Muhammad', ayahs: 38, type: 'Medinan' },
  { number: 48, name: 'الفتح', transliteration: 'Al-Fath', englishName: 'Al-Fath', ayahs: 29, type: 'Medinan' },
  { number: 49, name: 'الحجرات', transliteration: 'Al-Hujurat', englishName: 'Al-Hujurat', ayahs: 18, type: 'Medinan' },
  { number: 50, name: 'ق', transliteration: 'Qaf', englishName: 'Qaf', ayahs: 45, type: 'Meccan' },
  { number: 51, name: 'الذاريات', transliteration: 'Adh-Dhariyat', englishName: 'Adh-Dhariyat', ayahs: 60, type: 'Meccan' },
  { number: 52, name: 'الطور', transliteration: 'At-Tur', englishName: 'At-Tur', ayahs: 49, type: 'Meccan' },
  { number: 53, name: 'النجم', transliteration: 'An-Najm', englishName: 'An-Najm', ayahs: 62, type: 'Meccan' },
  { number: 54, name: 'القمر', transliteration: 'Al-Qamar', englishName: 'Al-Qamar', ayahs: 55, type: 'Meccan' },
  { number: 55, name: 'الرحمن', transliteration: 'Ar-Rahman', englishName: 'Ar-Rahman', ayahs: 78, type: 'Medinan' },
  { number: 56, name: 'الواقعة', transliteration: 'Al-Waqi\'ah', englishName: 'Al-Waqi\'ah', ayahs: 96, type: 'Meccan' },
  { number: 57, name: 'الحديد', transliteration: 'Al-Hadid', englishName: 'Al-Hadid', ayahs: 29, type: 'Medinan' },
  { number: 58, name: 'المجادلة', transliteration: 'Al-Mujadila', englishName: 'Al-Mujadila', ayahs: 22, type: 'Medinan' },
  { number: 59, name: 'الحشر', transliteration: 'Al-Hashr', englishName: 'Al-Hashr', ayahs: 24, type: 'Medinan' },
  { number: 60, name: 'الممتحنة', transliteration: 'Al-Mumtahanah', englishName: 'Al-Mumtahanah', ayahs: 13, type: 'Medinan' },
  { number: 61, name: 'الصف', transliteration: 'As-Saf', englishName: 'As-Saf', ayahs: 14, type: 'Medinan' },
  { number: 62, name: 'الجمعة', transliteration: 'Al-Jumu\'ah', englishName: 'Al-Jumu\'ah', ayahs: 11, type: 'Medinan' },
  { number: 63, name: 'المنافقون', transliteration: 'Al-Munafiqun', englishName: 'Al-Munafiqun', ayahs: 11, type: 'Medinan' },
  { number: 64, name: 'التغابن', transliteration: 'At-Taghabun', englishName: 'At-Taghabun', ayahs: 18, type: 'Medinan' },
  { number: 65, name: 'الطلاق', transliteration: 'At-Talaq', englishName: 'At-Talaq', ayahs: 12, type: 'Medinan' },
  { number: 66, name: 'التحريم', transliteration: 'At-Tahrim', englishName: 'At-Tahrim', ayahs: 12, type: 'Medinan' },
  { number: 67, name: 'الملك', transliteration: 'Al-Mulk', englishName: 'Al-Mulk', ayahs: 30, type: 'Meccan' },
  { number: 68, name: 'القلم', transliteration: 'Al-Qalam', englishName: 'Al-Qalam', ayahs: 52, type: 'Meccan' },
  { number: 69, name: 'الحاقة', transliteration: 'Al-Haqqah', englishName: 'Al-Haqqah', ayahs: 52, type: 'Meccan' },
  { number: 70, name: 'المعارج', transliteration: 'Al-Ma\'arij', englishName: 'Al-Ma\'arij', ayahs: 44, type: 'Meccan' },
  { number: 71, name: 'نوح', transliteration: 'Nuh', englishName: 'Nuh', ayahs: 28, type: 'Meccan' },
  { number: 72, name: 'الجن', transliteration: 'Al-Jinn', englishName: 'Al-Jinn', ayahs: 28, type: 'Meccan' },
  { number: 73, name: 'المزمل', transliteration: 'Al-Muzzammil', englishName: 'Al-Muzzammil', ayahs: 20, type: 'Meccan' },
  { number: 74, name: 'المدثر', transliteration: 'Al-Muddaththir', englishName: 'Al-Muddaththir', ayahs: 56, type: 'Meccan' },
  { number: 75, name: 'القيامة', transliteration: 'Al-Qiyamah', englishName: 'Al-Qiyamah', ayahs: 40, type: 'Meccan' },
  { number: 76, name: 'الانسان', transliteration: 'Al-Insan', englishName: 'Al-Insan', ayahs: 31, type: 'Medinan' },
  { number: 77, name: 'المرسلات', transliteration: 'Al-Mursalat', englishName: 'Al-Mursalat', ayahs: 50, type: 'Meccan' },
  { number: 78, name: 'النبإ', transliteration: 'An-Naba', englishName: 'An-Naba', ayahs: 40, type: 'Meccan' },
  { number: 79, name: 'النازعات', transliteration: 'An-Nazi\'at', englishName: 'An-Nazi\'at', ayahs: 46, type: 'Meccan' },
  { number: 80, name: 'عبس', transliteration: '\'Abasa', englishName: '\'Abasa', ayahs: 42, type: 'Meccan' },
  { number: 81, name: 'التكوير', transliteration: 'At-Takwir', englishName: 'At-Takwir', ayahs: 29, type: 'Meccan' },
  { number: 82, name: 'الإنفطار', transliteration: 'Al-Infitar', englishName: 'Al-Infitar', ayahs: 19, type: 'Meccan' },
  { number: 83, name: 'المطففين', transliteration: 'Al-Mutaffifin', englishName: 'Al-Mutaffifin', ayahs: 36, type: 'Meccan' },
  { number: 84, name: 'الإنشقاق', transliteration: 'Al-Inshiqaq', englishName: 'Al-Inshiqaq', ayahs: 25, type: 'Meccan' },
  { number: 85, name: 'البروج', transliteration: 'Al-Buruj', englishName: 'Al-Buruj', ayahs: 22, type: 'Meccan' },
  { number: 86, name: 'الطارق', transliteration: 'At-Tariq', englishName: 'At-Tariq', ayahs: 17, type: 'Meccan' },
  { number: 87, name: 'الأعلى', transliteration: 'Al-A\'la', englishName: 'Al-A\'la', ayahs: 19, type: 'Meccan' },
  { number: 88, name: 'الغاشية', transliteration: 'Al-Ghashiyah', englishName: 'Al-Ghashiyah', ayahs: 26, type: 'Meccan' },
  { number: 89, name: 'الفجر', transliteration: 'Al-Fajr', englishName: 'Al-Fajr', ayahs: 30, type: 'Meccan' },
  { number: 90, name: 'البلد', transliteration: 'Al-Balad', englishName: 'Al-Balad', ayahs: 20, type: 'Meccan' },
  { number: 91, name: 'الشمس', transliteration: 'Ash-Shams', englishName: 'Ash-Shams', ayahs: 15, type: 'Meccan' },
  { number: 92, name: 'الليل', transliteration: 'Al-Layl', englishName: 'Al-Layl', ayahs: 21, type: 'Meccan' },
  { number: 93, name: 'الضحى', transliteration: 'Ad-Duhaa', englishName: 'Ad-Duhaa', ayahs: 11, type: 'Meccan' },
  { number: 94, name: 'الشرح', transliteration: 'Ash-Sharh', englishName: 'Ash-Sharh', ayahs: 8, type: 'Meccan' },
  { number: 95, name: 'التين', transliteration: 'At-Tin', englishName: 'At-Tin', ayahs: 8, type: 'Meccan' },
  { number: 96, name: 'العلق', transliteration: 'Al-\'Alaq', englishName: 'Al-\'Alaq', ayahs: 19, type: 'Meccan' },
  { number: 97, name: 'القدر', transliteration: 'Al-Qadr', englishName: 'Al-Qadr', ayahs: 5, type: 'Meccan' },
  { number: 98, name: 'البينة', transliteration: 'Al-Bayyinah', englishName: 'Al-Bayyinah', ayahs: 8, type: 'Medinan' },
  { number: 99, name: 'الزلزلة', transliteration: 'Az-Zalzalah', englishName: 'Az-Zalzalah', ayahs: 8, type: 'Medinan' },
  { number: 100, name: 'العاديات', transliteration: 'Al-\'Adiyat', englishName: 'Al-\'Adiyat', ayahs: 11, type: 'Meccan' },
  { number: 101, name: 'القارعة', transliteration: 'Al-Qari\'ah', englishName: 'Al-Qari\'ah', ayahs: 11, type: 'Meccan' },
  { number: 102, name: 'التكاثر', transliteration: 'At-Takathur', englishName: 'At-Takathur', ayahs: 8, type: 'Meccan' },
  { number: 103, name: 'العصر', transliteration: 'Al-\'Asr', englishName: 'Al-\'Asr', ayahs: 3, type: 'Meccan' },
  { number: 104, name: 'الهمزة', transliteration: 'Al-Humazah', englishName: 'Al-Humazah', ayahs: 9, type: 'Meccan' },
  { number: 105, name: 'الفيل', transliteration: 'Al-Fil', englishName: 'Al-Fil', ayahs: 5, type: 'Meccan' },
  { number: 106, name: 'قريش', transliteration: 'Quraysh', englishName: 'Quraysh', ayahs: 4, type: 'Meccan' },
  { number: 107, name: 'الماعون', transliteration: 'Al-Ma\'un', englishName: 'Al-Ma\'un', ayahs: 7, type: 'Meccan' },
  { number: 108, name: 'الكوثر', transliteration: 'Al-Kawthar', englishName: 'Al-Kawthar', ayahs: 3, type: 'Meccan' },
  { number: 109, name: 'الكافرون', transliteration: 'Al-Kafirun', englishName: 'Al-Kafirun', ayahs: 6, type: 'Meccan' },
  { number: 110, name: 'النصر', transliteration: 'An-Nasr', englishName: 'An-Nasr', ayahs: 3, type: 'Medinan' },
  { number: 111, name: 'المسد', transliteration: 'Al-Masad', englishName: 'Al-Masad', ayahs: 5, type: 'Meccan' },
  { number: 112, name: 'الإخلاص', transliteration: 'Al-Ikhlas', englishName: 'Al-Ikhlas', ayahs: 4, type: 'Meccan' },
  { number: 113, name: 'الفلق', transliteration: 'Al-Falaq', englishName: 'Al-Falaq', ayahs: 5, type: 'Meccan' },
  { number: 114, name: 'الناس', transliteration: 'An-Nas', englishName: 'An-Nas', ayahs: 6, type: 'Meccan' },
];

/** Search across Quran text (requires loading surahs — use for targeted search). */
export async function searchQuran(query: string, translationCode: TranslationCode = 'en'): Promise<Array<{ surah: number; ayah: number; text: string }>> {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results: Array<{ surah: number; ayah: number; text: string }> = [];

  // Search through available surahs (limited to loaded ones for performance)
  for (const [num, surah] of surahCache) {
    for (const ayah of surah.ayahs) {
      const tr = ayah.translations[translationCode] || ayah.translations['en'] || '';
      if (tr.toLowerCase().includes(q) || ayah.arabic.includes(query)) {
        results.push({ surah: num, ayah: ayah.number, text: tr || ayah.arabic });
      }
    }
  }
  return results;
}
