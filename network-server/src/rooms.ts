import type { Player, PublicRoom, Room } from './types.js';

const rooms = new Map<string, Room>();
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 4;
const MAX_PLAYERS = 24;

function now() {
  return Date.now();
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ').slice(0, 24);
}

function generateRoomCode() {
  for (let attempts = 0; attempts < 100; attempts += 1) {
    let code = '';

    for (let index = 0; index < ROOM_CODE_LENGTH; index += 1) {
      code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
    }

    if (!rooms.has(code)) return code;
  }

  throw new Error('No se pudo crear un codigo de sala disponible.');
}

export function toPublicRoom(room: Room): PublicRoom {
  return {
    code: room.code,
    hostId: room.hostId,
    players: [...room.players.values()]
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .map((player) => ({
        id: player.id,
        name: player.name,
        isHost: player.id === room.hostId,
        connected: player.connected,
      })),
  };
}

export function createRoom(playerId: string, playerName: string) {
  const name = normalizeName(playerName);

  if (!name) throw new Error('Escribe un nombre para crear la sala.');

  const code = generateRoomCode();
  const player: Player = {
    id: playerId,
    name,
    isHost: true,
    connected: true,
    joinedAt: now(),
  };
  const room: Room = {
    code,
    hostId: playerId,
    players: new Map([[playerId, player]]),
    createdAt: now(),
    updatedAt: now(),
  };

  rooms.set(code, room);
  return room;
}

export function joinRoom(roomCode: string, playerId: string, playerName: string) {
  const code = roomCode.trim().toUpperCase();
  const name = normalizeName(playerName);
  const room = rooms.get(code);

  if (!room) throw new Error('No existe una sala con ese codigo.');
  if (!name) throw new Error('Escribe un nombre para unirte.');
  if (room.players.size >= MAX_PLAYERS) throw new Error('La sala esta llena.');
  if ([...room.players.values()].some((player) => player.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('Ya hay un jugador con ese nombre en la sala.');
  }

  room.players.set(playerId, {
    id: playerId,
    name,
    isHost: false,
    connected: true,
    joinedAt: now(),
  });
  room.updatedAt = now();

  return room;
}

export function getRoom(roomCode: string) {
  return rooms.get(roomCode.trim().toUpperCase());
}

export function removePlayer(roomCode: string, playerId: string) {
  const room = getRoom(roomCode);

  if (!room) return { room: undefined, removed: undefined, closed: false };

  const removed = room.players.get(playerId);
  room.players.delete(playerId);

  if (room.players.size === 0) {
    rooms.delete(room.code);
    return { room: undefined, removed, closed: true };
  }

  if (room.hostId === playerId) {
    const nextHost = [...room.players.values()].sort((a, b) => a.joinedAt - b.joinedAt)[0];
    room.hostId = nextHost.id;
    nextHost.isHost = true;
  }

  room.updatedAt = now();
  return { room, removed, closed: false };
}

export function listRooms() {
  return [...rooms.values()].map(toPublicRoom);
}
