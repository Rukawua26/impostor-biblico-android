import { getEntriesForCategory } from '../data/bibleDeck';
import type { CategoryId, Player, Round } from '../types/game';

function randomIndex(max: number) {
  return Math.floor(Math.random() * max);
}

function shuffledPlayers(players: Player[]) {
  const shuffled = [...players];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function pickImpostorIds(players: Player[], impostorCount: number, recentImpostorNames: string[]) {
  const recentNameSet = new Set(recentImpostorNames.map((name) => name.toLocaleLowerCase()));
  const eligiblePlayers = players.filter((player) => !recentNameSet.has(player.name.toLocaleLowerCase()));
  const pool = eligiblePlayers.length >= impostorCount ? eligiblePlayers : players;

  return shuffledPlayers(pool)
    .slice(0, impostorCount)
    .map((player) => player.id);
}

function pickFirstSpeaker(players: Player[], usedSpeakerIds: number[]) {
  const usedIdSet = new Set(usedSpeakerIds);
  const eligiblePlayers = players.filter((player) => !usedIdSet.has(player.id));
  const pool = eligiblePlayers.length ? eligiblePlayers : players;

  return pool[randomIndex(pool.length)];
}

const cluePool = [
  'Biblia',
  'Escritura',
  'Relato',
  'Historia',
  'Palabra',
  'Testimonio',
  'Ensenanza',
  'Sabiduria',
  'Fe',
  'Creencia',
  'Antiguo',
  'Pueblo',
  'Tierra',
  'Cielo',
  'Alianza',
  'Promesa',
  'Ley',
  'Profecia',
  'Verdad',
  'Luz',
  'Vida',
  'Amor',
  'Paz',
  'Esperanza',
  'Gracia',
  'Poder',
  'Senal',
  'Milagro',
  'Mandato',
  'Justicia',
];

function pickRandomClue(exclude: string) {
  const excludeKey = exclude.toLocaleLowerCase();
  const available = cluePool.filter((item) => item.toLocaleLowerCase() !== excludeKey);

  return available[Math.floor(Math.random() * available.length)] ?? 'Biblia';
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
  categoryId: CategoryId,
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
  const secondClue = pickRandomClue(selectedEntry.clue);
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
