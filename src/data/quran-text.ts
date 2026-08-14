/**
 * Quran text — selected surahs with Arabic text + English translation.
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * This file contains the full text of commonly recited surahs.
 * For a complete production app, the full 114 surahs would be bundled
 * as a separate JSON file (loaded on demand for memory efficiency).
 */

export interface Ayah {
  number: number;       // ayah number within the surah
  arabic: string;
  translation: string;
}

export interface SurahText {
  number: number;
  ayahs: Ayah[];
}

// Al-Fatiha (1)
export const AL_FATIHA: SurahText = {
  number: 1,
  ayahs: [
    { number: 1, arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
    { number: 2, arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: '[All] praise is [due] to Allah, Lord of the worlds.' },
    { number: 3, arabic: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'The Entirely Merciful, the Especially Merciful.' },
    { number: 4, arabic: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Sovereign of the Day of Recompense.' },
    { number: 5, arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'It is You we worship and You we ask for help.' },
    { number: 6, arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide us to the straight path.' },
    { number: 7, arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.' },
  ],
};

// Al-Ikhlas (112)
export const AL_IKHLAS: SurahText = {
  number: 112,
  ayahs: [
    { number: 1, arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', translation: 'Say, "He is Allah, [who is] One,' },
    { number: 2, arabic: 'اللَّهُ الصَّمَدُ', translation: 'Allah, the Eternal Refuge.' },
    { number: 3, arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', translation: 'He neither begets nor is born,' },
    { number: 4, arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', translation: 'Nor is there to Him any equivalent."' },
  ],
};

// Al-Falaq (113)
export const AL_FALAQ: SurahText = {
  number: 113,
  ayahs: [
    { number: 1, arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', translation: 'Say, "I seek refuge in the Lord of daybreak' },
    { number: 2, arabic: 'مِن شَرِّ مَا خَلَقَ', translation: 'From the evil of that which He created' },
    { number: 3, arabic: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', translation: 'And from the evil of darkness when it settles' },
    { number: 4, arabic: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', translation: 'And from the evil of the blowers in knots' },
    { number: 5, arabic: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', translation: 'And from the evil of an envier when he envies."' },
  ],
};

// An-Nas (114)
export const AN_NAS: SurahText = {
  number: 114,
  ayahs: [
    { number: 1, arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', translation: 'Say, "I seek refuge in the Lord of mankind,' },
    { number: 2, arabic: 'مَلِكِ النَّاسِ', translation: 'The Sovereign of mankind,' },
    { number: 3, arabic: 'إِلَٰهِ النَّاسِ', translation: 'The God of mankind,' },
    { number: 4, arabic: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', translation: 'From the evil of the retreating whisperer,' },
    { number: 5, arabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', translation: 'Who whispers [evil] into the breasts of mankind,' },
    { number: 6, arabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ', translation: 'From among the jinn and mankind."' },
  ],
};

// Al-Kawthar (108)
export const AL_KAWTHAR: SurahText = {
  number: 108,
  ayahs: [
    { number: 1, arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', translation: 'Indeed, We have granted you, [O Muhammad], al-Kawthar.' },
    { number: 2, arabic: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ', translation: 'So pray to your Lord and sacrifice [to Him alone].' },
    { number: 3, arabic: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ', translation: 'Indeed, your enemy is the one cut off.' },
  ],
};

// Al-Asr (103)
export const AL_ASR: SurahText = {
  number: 103,
  ayahs: [
    { number: 1, arabic: 'وَالْعَصْرِ', translation: 'By time,' },
    { number: 2, arabic: 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ', translation: 'Indeed, mankind is in loss,' },
    { number: 3, arabic: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ', translation: 'Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.' },
  ],
};

// An-Nasr (110)
export const AN_NASR: SurahText = {
  number: 110,
  ayahs: [
    { number: 1, arabic: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ', translation: 'When the victory of Allah has come and the conquest,' },
    { number: 2, arabic: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا', translation: 'And you see the people entering into the religion of Allah in multitudes.' },
    { number: 3, arabic: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا', translation: 'Then exalt [Him] with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance.' },
  ],
};

// Al-Masad (111)
export const AL_MASAD: SurahText = {
  number: 111,
  ayahs: [
    { number: 1, arabic: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ', translation: 'May the hands of Abu Lahab be ruined, and ruined is he.' },
    { number: 2, arabic: 'مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ', translation: 'His wealth will not avail him or that which he gained.' },
    { number: 3, arabic: 'سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ', translation: 'He will [enter to] burn in a Fire of [blazing] flame' },
    { number: 4, arabic: 'وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ', translation: 'And his wife [as well] - the carrier of firewood.' },
    { number: 5, arabic: 'فِي جِيدِهَا حَبْلٌ مِّن مَّسَدٍ', translation: 'Around her neck is a rope of [twisted] fiber.' },
  ],
};

// Al-Kafirun (109)
export const AL_KAFIRUN: SurahText = {
  number: 109,
  ayahs: [
    { number: 1, arabic: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ', translation: 'Say, "O disbelievers,' },
    { number: 2, arabic: 'لَا أَعْبُدُ مَا تَعْبُدُونَ', translation: 'I do not worship what you worship.' },
    { number: 3, arabic: 'وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ', translation: 'Nor are you worshippers of what I worship.' },
    { number: 4, arabic: 'وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ', translation: 'Nor will I be a worshipper of what you have worshipped.' },
    { number: 5, arabic: 'وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ', translation: 'Nor will you be worshippers of what I worship.' },
    { number: 6, arabic: 'لَكُمْ دِينُكُمْ وَلِيَ دِينِ', translation: 'For you is your religion, and for me is my religion."' },
  ],
};

// Al-Fil (105)
export const AL_FIL: SurahText = {
  number: 105,
  ayahs: [
    { number: 1, arabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ', translation: 'Have you not considered, [O Muhammad], how your Lord dealt with the companions of the elephant?' },
    { number: 2, arabic: 'أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ', translation: 'Did He not make their plan into misguidance?' },
    { number: 3, arabic: 'وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ', translation: 'And He sent against them birds in flocks,' },
    { number: 4, arabic: 'تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ', translation: 'Striking them with stones of hard clay,' },
    { number: 5, arabic: 'فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍ', translation: 'And He made them like eaten straw.' },
  ],
};

// Quraysh (106)
export const QURAYSH: SurahText = {
  number: 106,
  ayahs: [
    { number: 1, arabic: 'لِإِيلَافِ قُرَيْشٍ', translation: 'For the accustomed security of the Quraysh,' },
    { number: 2, arabic: 'إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ', translation: 'Their accustomed security [in] the caravan of winter and summer.' },
    { number: 3, arabic: 'فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ', translation: 'Let them worship the Lord of this House,' },
    { number: 4, arabic: 'الَّذِي أَطْعَمَهُم مِّن جُوعٍ وَآمَنَهُم مِّنْ خَوْفٍ', translation: 'Who has fed them, [saving them] from hunger and made them safe, [saving them] from fear.' },
  ],
};

// Al-Maun (107)
export const AL_MAUN: SurahText = {
  number: 107,
  ayahs: [
    { number: 1, arabic: 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ', translation: 'Have you seen the one who denies the Recompense?' },
    { number: 2, arabic: 'فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ', translation: 'For that is the one who drives away the orphan' },
    { number: 3, arabic: 'وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ', translation: 'And does not encourage the feeding of the poor.' },
    { number: 4, arabic: 'فَوَيْلٌ لِّلْمُصَلِّينَ', translation: 'So woe to those who pray' },
    { number: 5, arabic: 'الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ', translation: 'But who are heedless of their prayer,' },
    { number: 6, arabic: 'الَّذِينَ هُمْ يُرَاءُونَ', translation: 'Those who make show [of their deeds]' },
    { number: 7, arabic: 'وَيَمْنَعُونَ الْمَاعُونَ', translation: 'And withhold [simple] assistance.' },
  ],
};

/** Map of surah number → full text (for surahs we have full text for). */
export const SURAHS_TEXT: Record<number, SurahText> = {
  1: AL_FATIHA,
  103: AL_ASR,
  105: AL_FIL,
  106: QURAYSH,
  107: AL_MAUN,
  108: AL_KAWTHAR,
  109: AL_KAFIRUN,
  110: AN_NASR,
  111: AL_MASAD,
  112: AL_IKHLAS,
  113: AL_FALAQ,
  114: AN_NAS,
};

/** Check if we have the full text for a surah. */
export function hasSurahText(surahNumber: number): boolean {
  return surahNumber in SURAHS_TEXT;
}

/** Get the full text of a surah. Returns null if not available. */
export function getSurahText(surahNumber: number): SurahText | null {
  return SURAHS_TEXT[surahNumber] ?? null;
}
