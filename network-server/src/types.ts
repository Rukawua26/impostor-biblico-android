export type Player = {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  joinedAt: number;
};

export type Room = {
  code: string;
  hostId: string;
  players: Map<string, Player>;
  createdAt: number;
  updatedAt: number;
};

export type PublicPlayer = {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
};

export type PublicRoom = {
  code: string;
  hostId: string;
  players: PublicPlayer[];
};

export type ClientToServerEvents = {
  createRoom: (payload: { playerName: string }, callback: Ack<PublicRoom>) => void;
  joinRoom: (payload: { roomCode: string; playerName: string }, callback: Ack<PublicRoom>) => void;
  leaveRoom: (callback: Ack<{ left: true }>) => void;
};

export type ServerToClientEvents = {
  roomUpdated: (room: PublicRoom) => void;
  roomClosed: (payload: { reason: string }) => void;
  playerDisconnected: (payload: { playerId: string; playerName: string }) => void;
};

export type InterServerEvents = Record<string, never>;

export type SocketData = {
  roomCode?: string;
  playerName?: string;
};

export type Ack<T> = (response: { ok: true; data: T } | { ok: false; error: string }) => void;
