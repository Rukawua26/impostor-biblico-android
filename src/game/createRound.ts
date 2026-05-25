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

export function createRound(
  players: Player[],
  impostorCount: number,
  categoryId: string,
  usedWords: string[],
  recentImpostorNames: string[],
): Round {
  const entries = getEntriesForCategory(categoryId);
  const usedWordSet = new Set(usedWords.map((word) => word.toLocaleLowerCase()));
  const availableEntries = entries.filter((entry) => !usedWordSet.has(entry.word.toLocaleLowerCase()));
  const pool = availableEntries.length ? availableEntries : entries;
  const selectedEntry = pool[randomIndex(pool.length)];
  const firstSpeaker = players[randomIndex(players.length)];

  return {
    word: selectedEntry.word,
    impostorIds: pickImpostorIds(players, impostorCount, recentImpostorNames),
    impostorClue: selectedEntry.clue,
    impostorReference: selectedEntry.references,
    firstSpeakerId: firstSpeaker.id,
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
