import type { Player } from '../types/game';

export type VoteOutcome =
  | { type: 'result'; gameResult: 'innocents' | 'impostor'; eliminatedPlayerName: string }
  | { type: 'eliminated'; eliminatedPlayerName: string };

export function resolveVote(
  selectedVoteIds: number[],
  activeImpostorIds: number[],
  activePlayers: Player[],
  roundNumber: number,
  maxRounds: number,
): VoteOutcome | null {
  if (selectedVoteIds.length === 0) return null;

  const selectedIdSet = new Set(selectedVoteIds);
  const remainingImpostorIds = activeImpostorIds.filter((id) => !selectedIdSet.has(id));
  const eliminated = activePlayers.filter((player) => selectedIdSet.has(player.id));
  const eliminatedPlayerName = eliminated.map((player) => player.name).join(', ');

  if (remainingImpostorIds.length === 0) {
    return { type: 'result', gameResult: 'innocents', eliminatedPlayerName };
  }

  if (roundNumber >= maxRounds) {
    return { type: 'result', gameResult: 'impostor', eliminatedPlayerName };
  }

  return { type: 'eliminated', eliminatedPlayerName };
}

export type NextRoundOutcome =
  | { type: 'result'; gameResult: 'impostor' }
  | { type: 'continue'; remaining: Player[]; nextFirstSpeakerId: number };

export function resolveNextRound(
  selectedVoteIds: number[],
  activePlayers: Player[],
  roundImpostorIds: number[],
  roundStarterIds: number[],
): NextRoundOutcome {
  const selectedIdSet = new Set(selectedVoteIds);
  const remaining = activePlayers.filter((player) => !selectedIdSet.has(player.id));
  const remainingImpostorCount = roundImpostorIds.filter((id) =>
    remaining.some((player) => player.id === id),
  ).length;

  if (remaining.length <= remainingImpostorCount * 2) {
    return { type: 'result', gameResult: 'impostor' };
  }

  const nextFirstSpeakerId = pickNextFirstSpeaker(remaining, roundStarterIds);
  return { type: 'continue', remaining, nextFirstSpeakerId };
}

function pickNextFirstSpeaker(remaining: Player[], alreadySpokenIds: number[]): number {
  const notSpoken = remaining.filter((player) => !alreadySpokenIds.includes(player.id));
  if (notSpoken.length > 0) {
    return notSpoken[Math.floor(Math.random() * notSpoken.length)].id;
  }
  return remaining[Math.floor(Math.random() * remaining.length)].id;
}
