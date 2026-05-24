import { getWordsForCategory } from '../data/bibleDeck';
import { impostorPhrases } from '../data/impostorPhrases';
import type { Player, Round } from '../types/game';

function randomIndex(max: number) {
  return Math.floor(Math.random() * max);
}

function pickImpostorIds(players: Player[], impostorCount: number) {
  return [...players]
    .sort(() => Math.random() - 0.5)
    .slice(0, impostorCount)
    .map((player) => player.id);
}

export function createRound(players: Player[], impostorCount: number, categoryId: string): Round {
  const words = getWordsForCategory(categoryId);

  return {
    word: words[randomIndex(words.length)],
    impostorIds: pickImpostorIds(players, impostorCount),
    impostorPhrase: impostorPhrases[randomIndex(impostorPhrases.length)],
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
