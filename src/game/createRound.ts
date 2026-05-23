import { bibleDeck } from '../data/bibleDeck';
import type { Player, Round } from '../types/game';

function randomIndex(max: number) {
  return Math.floor(Math.random() * max);
}

export function createRound(players: Player[]): Round {
  return {
    word: bibleDeck[randomIndex(bibleDeck.length)],
    impostorId: players[randomIndex(players.length)].id,
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
