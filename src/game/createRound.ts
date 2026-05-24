import { getWordsForCategory } from '../data/bibleDeck';
import { fallbackImpostorClue, impostorClues } from '../data/impostorPhrases';
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
  const word = words[randomIndex(words.length)];
  const matchingClues = impostorClues.filter((clue) => clue.relatedWords.includes(word));
  const selectedClue = matchingClues.length
    ? matchingClues[randomIndex(matchingClues.length)]
    : fallbackImpostorClue;

  return {
    word,
    impostorIds: pickImpostorIds(players, impostorCount),
    impostorClue: selectedClue.clue,
    impostorReference: selectedClue.reference,
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
