/**
 * Hadith data — selected narrations from the major six collections.
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Collections: Sahih Bukhari, Sahih Muslim, Sunan Abu Dawud,
 * Jami at-Tirmidhi, Sunan an-Nasai, Sunan Ibn Majah.
 *
 * This file contains well-known narrations. For a complete production app,
 * the full collections (10,000+ hadith each) would be bundled as JSON.
 */

export interface Hadith {
  id: string;
  collection: HadithCollection;
  bookNumber: number;
  hadithNumber: number;
  arabic: string;
  english: string;
  narrator: string;
  grade: string;     // Sahih, Hasan, etc.
}

export type HadithCollection = 'bukhari' | 'muslim' | 'abudawud' | 'tirmidhi' | 'nasai' | 'ibnmajah';

export const COLLECTION_NAMES: Record<HadithCollection, { name: string; arabic: string; count: number }> = {
  bukhari:   { name: 'Sahih al-Bukhari',      arabic: 'صحيح البخاري',      count: 7563 },
  muslim:    { name: 'Sahih Muslim',          arabic: 'صحيح مسلم',          count: 7470 },
  abudawud:  { name: 'Sunan Abi Dawud',       arabic: 'سنن أبي داود',       count: 5274 },
  tirmidhi:  { name: 'Jami at-Tirmidhi',      arabic: 'جامع الترمذي',       count: 3956 },
  nasai:     { name: 'Sunan an-Nasai',        arabic: 'سنن النسائي',         count: 5758 },
  ibnmajah:  { name: 'Sunan Ibn Majah',       arabic: 'سنن ابن ماجه',        count: 4341 },
};

export const HADITHS: Hadith[] = [
  // === Sahih al-Bukhari ===
  {
    id: 'bukhari-1',
    collection: 'bukhari',
    bookNumber: 1,
    hadithNumber: 1,
    narrator: 'Umar ibn al-Khattab',
    grade: 'Sahih',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    english: 'I heard Allah\'s Messenger (ﷺ) saying, "The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended."',
  },
  {
    id: 'bukhari-2',
    collection: 'bukhari',
    bookNumber: 1,
    hadithNumber: 2,
    narrator: 'Aisha',
    grade: 'Sahih',
    arabic: 'مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ',
    english: 'Allah\'s Messenger (ﷺ) said, "Whoever introduces something into this affair of ours that does not belong to it, it is rejected."',
  },
  {
    id: 'bukhari-3',
    collection: 'bukhari',
    bookNumber: 2,
    hadithNumber: 7,
    narrator: 'Ibn Umar',
    grade: 'Sahih',
    arabic: 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ',
    english: 'The Prophet (ﷺ) said, "Islam is based on five (principles): To testify that none has the right to be worshipped but Allah and Muhammad is Allah\'s Messenger; to offer the (compulsory congregational) prayers dutifully and perfectly; to pay Zakat; to perform Hajj; and to observe fast during the month of Ramadan."',
  },
  {
    id: 'bukhari-4',
    collection: 'bukhari',
    bookNumber: 2,
    hadithNumber: 8,
    narrator: 'Ibn Abbas',
    grade: 'Sahih',
    arabic: 'أُمِرْتُ أَنْ أُقَاتِلَ النَّاسَ حَتَّى يَقُولُوا لاَ إِلَهَ إِلاَّ اللَّهُ',
    english: 'The Prophet (ﷺ) said, "I have been ordered to fight the people till they say: None has the right to be worshipped but Allah. And if they say so, pray like our prayers, face our Qibla, and slaughter as we slaughter, then their blood and property will be sacred to us."',
  },
  {
    id: 'bukhari-5',
    collection: 'bukhari',
    bookNumber: 3,
    hadithNumber: 13,
    narrator: 'Anas ibn Malik',
    grade: 'Sahih',
    arabic: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    english: 'The Prophet (ﷺ) said, "None of you will have faith till he wishes for his (Muslim) brother what he likes for himself."',
  },
  {
    id: 'bukhari-6',
    collection: 'bukhari',
    bookNumber: 4,
    hadithNumber: 27,
    narrator: 'Abdullah ibn Masud',
    grade: 'Sahih',
    arabic: 'الْحَلالُ بَيِّنٌ وَالْحَرَامُ بَيِّنٌ',
    english: 'The Prophet (ﷺ) said, "Lawful things are clear and unlawful things are clear, and between them are doubtful matters which many people do not know. So whoever guards against doubtful things keeps his religion and honor safe."',
  },

  // === Sahih Muslim ===
  {
    id: 'muslim-1',
    collection: 'muslim',
    bookNumber: 1,
    hadithNumber: 1,
    narrator: 'Umar ibn al-Khattab',
    grade: 'Sahih',
    arabic: 'الأَعْمَالُ بِالنِّيَّاتِ',
    english: 'The Messenger of Allah (ﷺ) said, "Actions are (judged) by motives, so each man will have what he intended."',
  },
  {
    id: 'muslim-2',
    collection: 'muslim',
    bookNumber: 1,
    hadithNumber: 2,
    narrator: 'Umar ibn al-Khattab',
    grade: 'Sahih',
    arabic: 'الإِسْلاَمُ أَنْ تَشْهَدَ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ',
    english: 'The Messenger of Allah (ﷺ) said, "Islam is to testify that there is none worthy of worship except Allah and that Muhammad is the Messenger of Allah, to establish the prayer, to give zakat, to fast Ramadan, and to perform Hajj to the House if you are able."',
  },
  {
    id: 'muslim-3',
    collection: 'muslim',
    bookNumber: 1,
    hadithNumber: 5,
    narrator: 'Abu Hurairah',
    grade: 'Sahih',
    arabic: 'أَنْ تُؤْمِنَ بِاللَّهِ وَمَلاَئِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ',
    english: 'The Prophet (ﷺ) said, "Faith is to believe in Allah, His angels, His books, His messengers, the Last Day, and to believe in divine destiny, both the good and the evil thereof."',
  },
  {
    id: 'muslim-4',
    collection: 'muslim',
    bookNumber: 1,
    hadithNumber: 65,
    narrator: 'Abu Sa\'id al-Khudri',
    grade: 'Sahih',
    arabic: 'مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ',
    english: 'The Messenger of Allah (ﷺ) said, "Whoever of you sees an evil, let him change it with his hand; and if he is not able, then with his tongue; and if he is not able, then with his heart — and that is the weakest of faith."',
  },

  // === Sunan Abi Dawud ===
  {
    id: 'abudawud-1',
    collection: 'abudawud',
    bookNumber: 1,
    hadithNumber: 1,
    narrator: 'Mu\'adh ibn Jabal',
    grade: 'Hasan',
    arabic: 'رَأْسُ الأَمْرِ الإِسْلاَمُ',
    english: 'The Prophet (ﷺ) said, "The head of the matter is Islam, its pillar is prayer, and its peak is jihad."',
  },
  {
    id: 'abudawud-2',
    collection: 'abudawud',
    bookNumber: 2,
    hadithNumber: 425,
    narrator: 'Abu Hurairah',
    grade: 'Sahih',
    arabic: 'صَلاَةُ الْجَمَاعَةِ أَفْضَلُ مِنْ صَلاَةِ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً',
    english: 'The Prophet (ﷺ) said, "The prayer in congregation is twenty-seven times superior to the prayer offered by a person alone."',
  },

  // === Jami at-Tirmidhi ===
  {
    id: 'tirmidhi-1',
    collection: 'tirmidhi',
    bookNumber: 36,
    hadithNumber: 2516,
    narrator: 'Mu\'adh ibn Jabal',
    grade: 'Sahih',
    arabic: 'الدِّينُ النَّصِيحَةُ',
    english: 'The Messenger of Allah (ﷺ) said, "Religion is sincerity." We said, "To whom?" He said, "To Allah, His Book, His Messenger, the leaders of the Muslims, and their common people."',
  },
  {
    id: 'tirmidhi-2',
    collection: 'tirmidhi',
    bookNumber: 36,
    hadithNumber: 2520,
    narrator: 'Ibn Umar',
    grade: 'Hasan',
    arabic: 'الْمُسْلِمُ أَخُو الْمُسْلِمِ',
    english: 'The Prophet (ﷺ) said, "A Muslim is the brother of a Muslim: he does not oppress him, nor does he fail him, nor does he lie to him, nor does he hold him in contempt."',
  },

  // === Sunan an-Nasai ===
  {
    id: 'nasai-1',
    collection: 'nasai',
    bookNumber: 1,
    hadithNumber: 1,
    narrator: 'Aisha',
    grade: 'Sahih',
    arabic: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
    english: 'The Messenger of Allah (ﷺ) said, "Cleanliness is half of faith."',
  },
  {
    id: 'nasai-2',
    collection: 'nasai',
    bookNumber: 12,
    hadithNumber: 1138,
    narrator: 'Abu Hurairah',
    grade: 'Sahih',
    arabic: 'إِذَا دَعَاكُمْ أَحَدُكُمْ فَلْيُجِبْ',
    english: 'The Prophet (ﷺ) said, "When one of you is invited to a meal, let him respond."',
  },

  // === Sunan Ibn Majah ===
  {
    id: 'ibnmajah-1',
    collection: 'ibnmajah',
    bookNumber: 1,
    hadithNumber: 1,
    narrator: 'Abu Hurairah',
    grade: 'Hasan',
    arabic: 'تَعَلَّمُوا الْعِلْمَ وَتَعَلَّمُوا لِلْعِلْمِ السَّكِينَةَ وَالْوَقَارَ',
    english: 'The Prophet (ﷺ) said, "Learn knowledge and learn for knowledge calmness and dignity."',
  },
  {
    id: 'ibnmajah-2',
    collection: 'ibnmajah',
    bookNumber: 33,
    hadithNumber: 4251,
    narrator: 'Anas ibn Malik',
    grade: 'Hasan',
    arabic: 'إِنَّ اللَّهَ لاَ يَظْلِمُ الْمُؤْمِنَ حَسَنَةً',
    english: 'The Prophet (ﷺ) said, "Allah does not wrong a believer a single good deed."',
  },
];

/** Get hadiths by collection. */
export function getHadithsByCollection(collection: HadithCollection): Hadith[] {
  return HADITHS.filter(h => h.collection === collection);
}

/** Search hadiths by text (in English or Arabic). */
export function searchHadiths(query: string): Hadith[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return HADITHS.filter(h =>
    h.english.toLowerCase().includes(q) ||
    h.arabic.includes(query) ||
    h.narrator.toLowerCase().includes(q)
  );
}
