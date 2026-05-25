export type Phase =
  | 'setup'
  | 'rules'
  | 'reveal'
  | 'discussion'
  | 'vote'
  | 'eliminated'
  | 'result';

export type Player = {
  id: number;
  name: string;
};

export type GameSettings = {
  discussionMinutes: number;
  voteMinutes: number;
  maxRounds: number;
  impostorCount: number;
  categoryId: string;
};

export type Round = {
  word: string;
  impostorIds: number[];
  impostorClue: string;
  impostorCluesById: Record<number, string>;
  impostorReference: string;
  firstSpeakerId: number;
};

export type GameResult = 'innocents' | 'impostor' | null;
