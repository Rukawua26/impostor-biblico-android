import { getEntriesForCategory } from '../data/bibleDeck';
import type { Player, Round } from '../types/game';

function randomIndex(max: number) {
  return Math.floor(Math.random() * max);
}

function pickImpostorIds(players: Player[], impostorCount: number, recentImpostorNames: string[]) {
  const recentNameSet = new Set(recentImpostorNames.map((name) => name.toLocaleLowerCase()));
  const eligiblePlayers = players.filter(
    (player) => !recentNameSet.has(player.name.toLocaleLowerCase()),
  );
  const pool = eligiblePlayers.length >= impostorCount ? eligiblePlayers : players;

  return [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, impostorCount)
    .map((player) => player.id);
}

function pickFirstSpeaker(players: Player[], usedSpeakerIds: number[]) {
  const usedIdSet = new Set(usedSpeakerIds);
  const eligiblePlayers = players.filter((player) => !usedIdSet.has(player.id));
  const pool = eligiblePlayers.length ? eligiblePlayers : players;

  return pool[randomIndex(pool.length)];
}

function getSecondClue(word: string, firstClue: string) {
  const firstKey = firstClue.toLocaleLowerCase();
  const fallbackWords = word
    .split(/\s+/)
    .map((item) => item.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, ''))
    .filter((item) => item.length > 3 && item.toLocaleLowerCase() !== firstKey);

  return fallbackWords[0] ?? 'Biblia';
}

function assignImpostorClues(impostorIds: number[], firstClue: string, secondClue: string) {
  return impostorIds.reduce<Record<number, string>>((clues, impostorId, index) => {
    clues[impostorId] = index % 2 === 0 ? firstClue : secondClue;
    return clues;
  }, {});
}

export function pickNextFirstSpeaker(players: Player[], usedSpeakerIds: number[]) {
  return pickFirstSpeaker(players, usedSpeakerIds).id;
}

export function createRound(
  players: Player[],
  impostorCount: number,
  categoryId: string,
  usedWords: string[],
  recentImpostorNames: string[],
  usedSpeakerIds: number[],
): Round {
  const entries = getEntriesForCategory(categoryId);
  const usedWordSet = new Set(usedWords.map((word) => word.toLocaleLowerCase()));
  const availableEntries = entries.filter((entry) => !usedWordSet.has(entry.word.toLocaleLowerCase()));
  const pool = availableEntries.length ? availableEntries : entries;
  const selectedEntry = pool[randomIndex(pool.length)];
  const impostorIds = pickImpostorIds(players, impostorCount, recentImpostorNames);
  const secondClue = getSecondClue(selectedEntry.word, selectedEntry.clue);
  const firstSpeakerId = pickNextFirstSpeaker(players, usedSpeakerIds);

  return {
    word: selectedEntry.word,
    impostorIds,
    impostorClue: selectedEntry.clue,
    impostorCluesById: assignImpostorClues(impostorIds, selectedEntry.clue, secondClue),
    impostorReference: selectedEntry.references,
    firstSpeakerId,
  };
}

export function normalizePlayers(players: Player[]) {
  const seenNames = new Set<string>();

  return players
    .map((player) => ({ ...player, name: player.name.trim() }))
    .filter((player) => {
      if (!player.name) return false;

      const key = player.name.toLocaleLowerCase();

      if (seenNames.has(key)) return false;

      seenNames.add(key);
      return true;
    });
}
