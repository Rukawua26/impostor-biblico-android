import AsyncStorage from '@react-native-async-storage/async-storage';

const FREQUENT_PLAYERS_KEY = 'impostor-biblico.frequentPlayers';
const USED_WORDS_KEY = 'impostor-biblico.usedWords';

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

export async function loadFrequentPlayers() {
  return uniqueCleanNames(parseStringArray(await AsyncStorage.getItem(FREQUENT_PLAYERS_KEY)));
}

export async function saveFrequentPlayers(names: string[]) {
  const cleanNames = uniqueCleanNames(names);
  await AsyncStorage.setItem(FREQUENT_PLAYERS_KEY, JSON.stringify(cleanNames));
  return cleanNames;
}

export async function loadUsedWords() {
  return parseStringArray(await AsyncStorage.getItem(USED_WORDS_KEY));
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

  await AsyncStorage.setItem(USED_WORDS_KEY, JSON.stringify(cleanWords));
  return cleanWords;
}
