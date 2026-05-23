export type Phase = 'setup' | 'rules' | 'reveal' | 'discussion' | 'vote' | 'result';

export type Player = {
  id: number;
  name: string;
};

export type GameSettings = {
  discussionSeconds: number;
  voteSeconds: number;
};

export type Round = {
  word: string;
  impostorId: number;
};
