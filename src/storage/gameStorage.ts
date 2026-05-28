import AsyncStorage from '@react-native-async-storage/async-storage';

const FREQUENT_PLAYERS_KEY = 'impostor-biblico.frequentPlayers';
const USED_WORDS_KEY = 'impostor-biblico.usedWords';
const RECENT_IMPOSTORS_KEY = 'impostor-biblico.recentImpostors';

function parseStringArray(value: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

function uniqueCleanNames(names: string[]) {
  const seen = new Set<string>();

  return names
    .map((name) => name.trim())
    .filter((name) => {
      if (!name) return false;

      const key = name.toLocaleLowerCase();
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
}

async function safeGet(key: string) {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function safeSet(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.warn('Storage write failed:', key, e); // eslint-disable-line no-console
  }
}

export async function loadFrequentPlayers() {
  return uniqueCleanNames(parseStringArray(await safeGet(FREQUENT_PLAYERS_KEY)));
}

export async function saveFrequentPlayers(names: string[]) {
  const cleanNames = uniqueCleanNames(names);
  await safeSet(FREQUENT_PLAYERS_KEY, JSON.stringify(cleanNames));
  return cleanNames;
}

export async function loadUsedWords() {
  return parseStringArray(await safeGet(USED_WORDS_KEY));
}

export async function saveUsedWords(words: string[]) {
  const seen = new Set<string>();
  const cleanWords = words
    .map((word) => word.trim())
    .filter((word) => {
      if (!word) return false;

      const key = word.toLocaleLowerCase();
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });

  await safeSet(USED_WORDS_KEY, JSON.stringify(cleanWords));
  return cleanWords;
}

export async function loadRecentImpostors() {
  return parseStringArray(await safeGet(RECENT_IMPOSTORS_KEY));
}

export async function saveRecentImpostors(names: string[]) {
  const cleanNames = uniqueCleanNames(names);
  await safeSet(RECENT_IMPOSTORS_KEY, JSON.stringify(cleanNames));
  return cleanNames;
}
