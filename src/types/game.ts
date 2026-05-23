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
  discussionSeconds: number;
  voteSeconds: number;
  maxRounds: number;
};

export type Round = {
  word: string;
  impostorId: number;
  impostorPhrase: string;
};

export type GameResult = 'innocents' | 'impostor' | null;
