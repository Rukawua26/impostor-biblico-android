import { gameReducer, initialGameState } from '../gameReducer';
import type { GameState } from '../gameReducer';

function setup(overrides?: Partial<GameState>): GameState {
  return { ...initialGameState, ...overrides, phase: overrides?.phase ?? 'setup' };
}

describe('gameReducer', () => {
  describe('phase transitions', () => {
    it('setup → rules', () => {
      const next = gameReducer(setup({ phase: 'setup' }), { type: 'SET_PHASE', phase: 'rules' });
      expect(next.phase).toBe('rules');
    });

    it('rules → reveal', () => {
      const next = gameReducer(setup({ phase: 'rules' }), { type: 'SET_PHASE', phase: 'reveal' });
      expect(next.phase).toBe('reveal');
    });

    it('throws on invalid transition setup → reveal', () => {
      expect(() => gameReducer(setup({ phase: 'setup' }), { type: 'SET_PHASE', phase: 'reveal' })).toThrow(
        'Invalid phase transition',
      );
    });

    it('throws on invalid transition result → intro', () => {
      expect(() => gameReducer(setup({ phase: 'result' }), { type: 'SET_PHASE', phase: 'intro' })).toThrow(
        'Invalid phase transition',
      );
    });
  });

  describe('START_GAME', () => {
    const payload = {
      players: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Carol' },
      ],
      round: {
        word: 'test',
        impostorIds: [1],
        impostorClue: 'clue',
        impostorCluesById: { 1: 'clue' },
        impostorReference: 'ref',
        firstSpeakerId: 2,
      },
      settings: {
        discussionMinutes: 5,
        voteMinutes: 3,
        maxRounds: 20,
        impostorCount: 1,
        categoryId: 'historias' as const,
      },
      frequentPlayers: ['Alice', 'Bob', 'Carol'],
      usedWords: ['old'],
      recentImpostors: ['Alice'],
    };

    it('sets phase to rules', () => {
      const next = gameReducer(setup(), { type: 'START_GAME', payload });
      expect(next.phase).toBe('rules');
    });

    it('sets active and all players', () => {
      const next = gameReducer(setup(), { type: 'START_GAME', payload });
      expect(next.allPlayers).toHaveLength(3);
      expect(next.activePlayers).toHaveLength(3);
    });

    it('initialises timers from settings', () => {
      const next = gameReducer(setup(), { type: 'START_GAME', payload });
      expect(next.discussionTimeLeft).toBe(5 * 60);
      expect(next.voteTimeLeft).toBe(3 * 60);
    });
  });

  describe('reveal flow', () => {
    it('SHOW_CARD sets cardVisible and resets curtain', () => {
      const next = gameReducer(setup(), { type: 'SHOW_CARD' });
      expect(next.cardVisible).toBe(true);
      expect(next.curtainLifted).toBe(false);
    });

    it('LIFT_CURTAIN sets curtainLifted', () => {
      const next = gameReducer(setup(), { type: 'LIFT_CURTAIN' });
      expect(next.curtainLifted).toBe(true);
    });

    it('RESET_CURTAIN clears curtainLifted', () => {
      const next = gameReducer(setup({ curtainLifted: true }), { type: 'RESET_CURTAIN' });
      expect(next.curtainLifted).toBe(false);
    });

    it('CONTINUE_REVEAL advances index when not last player', () => {
      const state = setup({
        phase: 'reveal',
        activePlayers: [
          { id: 1, name: 'A' },
          { id: 2, name: 'B' },
          { id: 3, name: 'C' },
        ],
        revealIndex: 0,
      });
      const next = gameReducer(state, { type: 'CONTINUE_REVEAL', maxDiscussionMinutes: 5 });
      expect(next.revealIndex).toBe(1);
      expect(next.cardVisible).toBe(false);
      expect(next.curtainLifted).toBe(false);
    });

    it('CONTINUE_REVEAL transitions to discussion on last player', () => {
      const state = setup({
        phase: 'reveal',
        activePlayers: [
          { id: 1, name: 'A' },
          { id: 2, name: 'B' },
        ],
        revealIndex: 1,
      });
      const next = gameReducer(state, { type: 'CONTINUE_REVEAL', maxDiscussionMinutes: 5 });
      expect(next.phase).toBe('discussion');
      expect(next.discussionTimeLeft).toBe(5 * 60);
    });
  });

  describe('voting', () => {
    it('TOGGLE_VOTE adds selection', () => {
      const state = setup({
        selectedVoteIds: [],
        settings: { ...initialGameState.settings, impostorCount: 2 },
      });
      const next = gameReducer(state, { type: 'TOGGLE_VOTE', playerId: 1 });
      expect(next.selectedVoteIds).toEqual([1]);
    });

    it('TOGGLE_VOTE removes existing selection', () => {
      const state = setup({ selectedVoteIds: [1] });
      const next = gameReducer(state, { type: 'TOGGLE_VOTE', playerId: 1 });
      expect(next.selectedVoteIds).toEqual([]);
    });

    it('TOGGLE_VOTE respects impostorCount limit', () => {
      const state = setup({
        selectedVoteIds: [1],
        settings: { ...initialGameState.settings, impostorCount: 1 },
      });
      const next = gameReducer(state, { type: 'TOGGLE_VOTE', playerId: 2 });
      expect(next.selectedVoteIds).toEqual([1]);
    });

    it('HANDLE_VOTE_RESULT sets eliminated phase', () => {
      const next = gameReducer(setup(), {
        type: 'HANDLE_VOTE_RESULT',
        phase: 'eliminated',
        eliminatedPlayerName: 'Bob',
      });
      expect(next.phase).toBe('eliminated');
      expect(next.eliminatedPlayerName).toBe('Bob');
    });

    it('HANDLE_VOTE_RESULT sets result phase with game result', () => {
      const next = gameReducer(setup(), {
        type: 'HANDLE_VOTE_RESULT',
        phase: 'result',
        eliminatedPlayerName: 'Alice',
        gameResult: 'innocents',
      });
      expect(next.phase).toBe('result');
      expect(next.gameResult).toBe('innocents');
    });
  });

  describe('NEXT_ROUND', () => {
    const payload = {
      remaining: [
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Carol' },
      ],
      nextFirstSpeakerId: 2,
      roundStarterIds: [2],
      discussionMinutes: 5,
    };

    it('sets discussion phase and remaining players', () => {
      const state = setup({
        round: {
          word: 'w',
          impostorIds: [1],
          impostorClue: 'c',
          impostorCluesById: { 1: 'c' },
          impostorReference: 'r',
          firstSpeakerId: 1,
        },
      });
      const next = gameReducer(state, { type: 'NEXT_ROUND', payload });
      expect(next.phase).toBe('discussion');
      expect(next.activePlayers).toHaveLength(2);
      expect(next.roundNumber).toBe(2);
      expect(next.discussionTimeLeft).toBe(5 * 60);
    });
  });

  describe('RESET_GAME', () => {
    it('resets to setup phase with clean state', () => {
      const state = setup({
        phase: 'result',
        gameResult: 'innocents',
        activePlayers: [{ id: 1, name: 'A' }],
      });
      const next = gameReducer(state, { type: 'RESET_GAME' });
      expect(next.phase).toBe('setup');
      expect(next.activePlayers).toEqual([]);
      expect(next.gameResult).toBeNull();
    });
  });

  describe('timers', () => {
    it('DECREMENT_DISCUSSION_TIME decrements', () => {
      const next = gameReducer(setup({ discussionTimeLeft: 10 }), { type: 'DECREMENT_DISCUSSION_TIME' });
      expect(next.discussionTimeLeft).toBe(9);
    });

    it('DECREMENT_DISCUSSION_TIME stops at 0', () => {
      const next = gameReducer(setup({ discussionTimeLeft: 0 }), { type: 'DECREMENT_DISCUSSION_TIME' });
      expect(next.discussionTimeLeft).toBe(0);
    });

    it('DECREMENT_VOTE_TIME decrements', () => {
      const next = gameReducer(setup({ voteTimeLeft: 10 }), { type: 'DECREMENT_VOTE_TIME' });
      expect(next.voteTimeLeft).toBe(9);
    });
  });
});
