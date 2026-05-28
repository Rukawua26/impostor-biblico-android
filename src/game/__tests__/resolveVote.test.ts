import { resolveVote, resolveNextRound } from '../resolveVote';
import type { Player } from '../../types/game';

const players: Player[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Carol' },
  { id: 4, name: 'David' },
];

describe('resolveVote', () => {
  it('returns null when no votes cast', () => {
    expect(resolveVote([], [1], players, 1, 5)).toBeNull();
  });

  it('returns innocents win when all impostors eliminated', () => {
    const outcome = resolveVote([1, 3], [1, 3], players, 1, 5);
    expect(outcome).toEqual({
      type: 'result',
      gameResult: 'innocents',
      eliminatedPlayerName: 'Alice, Carol',
    });
  });

  it('returns impostors win when max rounds reached', () => {
    const outcome = resolveVote([1], [2, 3], players, 5, 5);
    expect(outcome).toEqual({
      type: 'result',
      gameResult: 'impostor',
      eliminatedPlayerName: 'Alice',
    });
  });

  it('returns eliminated when impostors remain and rounds left', () => {
    const outcome = resolveVote([1], [2], players, 1, 5);
    expect(outcome).toEqual({
      type: 'eliminated',
      eliminatedPlayerName: 'Alice',
    });
  });

  it('handles multiple selected players', () => {
    const outcome = resolveVote([1, 2], [3], players, 1, 5);
    expect(outcome).toEqual({
      type: 'eliminated',
      eliminatedPlayerName: 'Alice, Bob',
    });
  });
});

describe('resolveNextRound', () => {
  it('returns impostor win when remaining <= impostors * 2', () => {
    const outcome = resolveNextRound([1, 3], players, [2, 4], [1]);
    expect(outcome).toEqual({ type: 'result', gameResult: 'impostor' });
  });

  it('returns continue when enough players remain', () => {
    const outcome = resolveNextRound([1], players, [2], [3]);
    if (outcome.type !== 'continue') {
      throw new Error('expected continue');
    }
    expect(outcome.remaining).toHaveLength(3);
    expect(outcome.remaining.map((p) => p.id)).not.toContain(1);
    expect(outcome.nextFirstSpeakerId).toBeGreaterThan(0);
  });

  it('picks a speaker from remaining players', () => {
    const outcome = resolveNextRound([1], players, [2], [2, 3, 4]);
    if (outcome.type !== 'continue') {
      throw new Error('expected continue');
    }
    expect(outcome.remaining).toHaveLength(3);
    expect(outcome.remaining.map((p) => p.id)).not.toContain(1);
    expect(outcome.remaining.map((p) => p.id)).toContain(outcome.nextFirstSpeakerId);
  });

  it('returns all remaining players excluding selected', () => {
    const outcome = resolveNextRound([1], players, [4], [3]);
    if (outcome.type !== 'continue') {
      throw new Error('expected continue');
    }
    expect(outcome.remaining).toHaveLength(3);
    expect(outcome.remaining.map((p) => p.id)).toEqual([2, 3, 4]);
  });
});
