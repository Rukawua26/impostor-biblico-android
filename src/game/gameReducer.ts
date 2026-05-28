import type { GameResult, GameSettings, Player, Round } from '../types/game';

export type Phase = 'intro' | 'setup' | 'rules' | 'reveal' | 'discussion' | 'vote' | 'eliminated' | 'result';

export interface GameState {
  phase: Phase;
  allPlayers: Player[];
  activePlayers: Player[];
  frequentPlayers: string[];
  settings: GameSettings;
  round: Round | null;
  roundNumber: number;
  revealIndex: number;
  roundStarterIds: number[];
  cardVisible: boolean;
  curtainLifted: boolean;
  selectedVoteIds: number[];
  eliminatedIds: number[];
  eliminatedPlayerName: string;
  gameResult: GameResult;
  discussionTimeLeft: number;
  voteTimeLeft: number;
  usedWords: string[];
  recentImpostors: string[];
}

const PHASE_TRANSITIONS: Record<Phase, Phase[]> = {
  intro: ['setup'],
  setup: ['rules'],
  rules: ['reveal'],
  reveal: ['discussion', 'reveal'],
  discussion: ['vote'],
  vote: ['eliminated', 'result'],
  eliminated: ['discussion', 'result'],
  result: ['setup'],
};

function validateTransition(from: Phase, to: Phase): void {
  const allowed = PHASE_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new Error(`Invalid phase transition: ${from} → ${to}`);
  }
}

export type GameAction =
  | {
      type: 'LOAD_SAVED_DATA';
      payload: {
        frequentPlayers: string[];
        usedWords: string[];
        recentImpostors: string[];
        players: Player[];
      };
    }
  | { type: 'SET_PHASE'; phase: Phase }
  | { type: 'SET_SETTINGS'; settings: GameSettings }
  | { type: 'ADD_PLAYER'; player: Player }
  | { type: 'REMOVE_PLAYER'; id: number }
  | { type: 'UPDATE_PLAYER_NAME'; id: number; name: string }
  | { type: 'SET_FREQUENT_PLAYERS'; players: string[] }
  | { type: 'SET_USED_WORDS'; words: string[] }
  | { type: 'SET_RECENT_IMPOSTORS'; impostors: string[] }
  | {
      type: 'START_GAME';
      payload: {
        players: Player[];
        round: Round;
        settings: GameSettings;
        frequentPlayers: string[];
        usedWords: string[];
        recentImpostors: string[];
      };
    }
  | { type: 'BEGIN_REVEAL' }
  | { type: 'SHOW_CARD' }
  | { type: 'LIFT_CURTAIN' }
  | { type: 'RESET_CURTAIN' }
  | { type: 'CONTINUE_REVEAL'; maxDiscussionMinutes: number }
  | { type: 'GO_TO_VOTE'; voteMinutes: number }
  | { type: 'TOGGLE_VOTE'; playerId: number }
  | {
      type: 'HANDLE_VOTE_RESULT';
      eliminatedPlayerName: string;
      phase: 'eliminated' | 'result';
      gameResult?: GameResult;
    }
  | {
      type: 'NEXT_ROUND';
      payload: {
        remaining: Player[];
        nextFirstSpeakerId: number;
        roundStarterIds: number[];
        discussionMinutes: number;
      };
    }
  | { type: 'IMPOSTOR_WIN'; eliminatedPlayerName: string }
  | { type: 'RESET_GAME' }
  | { type: 'DECREMENT_DISCUSSION_TIME' }
  | { type: 'DECREMENT_VOTE_TIME' };

const defaultSettings: GameSettings = {
  discussionMinutes: 0,
  voteMinutes: 0,
  maxRounds: 20,
  impostorCount: 1,
  categoryId: 'historias',
};

export const initialGameState: GameState = {
  phase: 'setup',
  allPlayers: [],
  activePlayers: [],
  frequentPlayers: [],
  settings: defaultSettings,
  round: null,
  roundNumber: 1,
  revealIndex: 0,
  roundStarterIds: [],
  cardVisible: false,
  curtainLifted: false,
  selectedVoteIds: [],
  eliminatedIds: [],
  eliminatedPlayerName: '',
  gameResult: null,
  discussionTimeLeft: 0,
  voteTimeLeft: 0,
  usedWords: [],
  recentImpostors: [],
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_SAVED_DATA': {
      return {
        ...state,
        frequentPlayers: action.payload.frequentPlayers,
        allPlayers: action.payload.players,
        usedWords: action.payload.usedWords,
        recentImpostors: action.payload.recentImpostors,
      };
    }

    case 'SET_PHASE': {
      validateTransition(state.phase, action.phase);
      return { ...state, phase: action.phase };
    }

    case 'SET_SETTINGS': {
      return { ...state, settings: action.settings };
    }

    case 'ADD_PLAYER': {
      const exists = state.allPlayers.some(
        (p) => p.name.trim().toLocaleLowerCase() === action.player.name.trim().toLocaleLowerCase(),
      );
      if (exists) return state;
      return { ...state, allPlayers: [...state.allPlayers, action.player] };
    }

    case 'REMOVE_PLAYER': {
      return { ...state, allPlayers: state.allPlayers.filter((p) => p.id !== action.id) };
    }

    case 'UPDATE_PLAYER_NAME': {
      return {
        ...state,
        allPlayers: state.allPlayers.map((p) => (p.id === action.id ? { ...p, name: action.name } : p)),
      };
    }

    case 'SET_FREQUENT_PLAYERS': {
      return { ...state, frequentPlayers: action.players };
    }

    case 'SET_USED_WORDS': {
      return { ...state, usedWords: action.words };
    }

    case 'SET_RECENT_IMPOSTORS': {
      return { ...state, recentImpostors: action.impostors };
    }

    case 'START_GAME': {
      return {
        ...state,
        phase: 'rules',
        allPlayers: action.payload.players,
        activePlayers: action.payload.players,
        frequentPlayers: action.payload.frequentPlayers,
        settings: action.payload.settings,
        round: action.payload.round,
        revealIndex: 0,
        cardVisible: false,
        curtainLifted: false,
        selectedVoteIds: [],
        eliminatedIds: [],
        eliminatedPlayerName: '',
        gameResult: null,
        discussionTimeLeft: action.payload.settings.discussionMinutes * 60,
        voteTimeLeft: action.payload.settings.voteMinutes * 60,
        roundNumber: 1,
        roundStarterIds: [action.payload.round.firstSpeakerId],
        usedWords: action.payload.usedWords,
        recentImpostors: action.payload.recentImpostors,
      };
    }

    case 'BEGIN_REVEAL': {
      return { ...state, phase: 'reveal' };
    }

    case 'SHOW_CARD': {
      return { ...state, cardVisible: true, curtainLifted: false };
    }

    case 'LIFT_CURTAIN': {
      return { ...state, curtainLifted: true };
    }

    case 'RESET_CURTAIN': {
      return { ...state, curtainLifted: false };
    }

    case 'CONTINUE_REVEAL': {
      if (state.revealIndex >= state.activePlayers.length - 1) {
        return {
          ...state,
          phase: 'discussion',
          cardVisible: false,
          curtainLifted: false,
          discussionTimeLeft: action.maxDiscussionMinutes * 60,
        };
      }
      return {
        ...state,
        revealIndex: state.revealIndex + 1,
        cardVisible: false,
        curtainLifted: false,
      };
    }

    case 'GO_TO_VOTE': {
      return {
        ...state,
        phase: 'vote',
        selectedVoteIds: [],
        voteTimeLeft: action.voteMinutes * 60,
      };
    }

    case 'TOGGLE_VOTE': {
      const { selectedVoteIds, settings } = state;
      if (selectedVoteIds.includes(action.playerId)) {
        return { ...state, selectedVoteIds: selectedVoteIds.filter((id) => id !== action.playerId) };
      }
      if (selectedVoteIds.length >= settings.impostorCount) return state;
      return { ...state, selectedVoteIds: [...selectedVoteIds, action.playerId] };
    }

    case 'HANDLE_VOTE_RESULT': {
      return {
        ...state,
        phase: action.phase,
        eliminatedPlayerName: action.eliminatedPlayerName,
        ...(action.gameResult ? { gameResult: action.gameResult } : {}),
      };
    }

    case 'NEXT_ROUND': {
      return {
        ...state,
        phase: 'discussion',
        activePlayers: action.payload.remaining,
        roundNumber: state.roundNumber + 1,
        round: state.round ? { ...state.round, firstSpeakerId: action.payload.nextFirstSpeakerId } : null,
        roundStarterIds: action.payload.roundStarterIds,
        discussionTimeLeft: action.payload.discussionMinutes * 60,
        cardVisible: false,
        curtainLifted: false,
        selectedVoteIds: [],
        eliminatedIds: [...state.eliminatedIds, ...state.selectedVoteIds],
      };
    }

    case 'IMPOSTOR_WIN': {
      return {
        ...state,
        phase: 'result',
        gameResult: 'impostor',
        eliminatedPlayerName: action.eliminatedPlayerName,
      };
    }

    case 'RESET_GAME': {
      return {
        ...state,
        phase: 'setup',
        activePlayers: [],
        revealIndex: 0,
        cardVisible: false,
        curtainLifted: false,
        selectedVoteIds: [],
        round: null,
        roundNumber: 1,
        roundStarterIds: [],
        eliminatedIds: [],
        gameResult: null,
        eliminatedPlayerName: '',
        discussionTimeLeft: 0,
        voteTimeLeft: 0,
      };
    }

    case 'DECREMENT_DISCUSSION_TIME': {
      if (state.discussionTimeLeft <= 0) return state;
      return { ...state, discussionTimeLeft: state.discussionTimeLeft - 1 };
    }

    case 'DECREMENT_VOTE_TIME': {
      if (state.voteTimeLeft <= 0) return state;
      return { ...state, voteTimeLeft: state.voteTimeLeft - 1 };
    }

    default:
      return state;
  }
}
