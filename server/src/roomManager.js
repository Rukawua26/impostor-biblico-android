import { v4 as uuidv4 } from 'uuid';
import { initGame, giveClue, castVote, cleanupGame } from './gameEngine.js';

const ROOM_CODE_LENGTH = 6;
const RECONNECT_GRACE_SECONDS = 60;

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = '';
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (rooms.has(code));
  return code;
}

function getPlayerList(room) {
  const jugadores = [];
  for (const player of room.players.values()) {
    jugadores.push({
      id: player.id,
      name: player.name,
      isHost: player.isHost,
    });
  }
  return jugadores;
}

function broadcastPlayerList(room) {
  const jugadores = getPlayerList(room);
  for (const player of room.players.values()) {
    if (player.socket) {
      player.socket.emit('sala_actualizada', { jugadores });
    }
  }
}

export function createRoom(hostSocket, hostName) {
  const code = generateRoomCode();
  const playerId = uuidv4();

  const hostPlayer = {
    id: playerId,
    name: hostName,
    socket: hostSocket,
    isHost: true,
    disconnectTimer: null,
    lastSocketId: hostSocket.id,
  };

  const room = {
    code,
    players: new Map([[playerId, hostPlayer]]),
    gameStarted: false,
    usedWords: [],
  };

  rooms.set(code, room);
  hostSocket.joinRoom?.(code) ?? (hostSocket.roomCode = code);

  hostSocket.emit('sala_creada', { codigo: code });
  hostSocket.emit('lista_jugadores', { jugadores: getPlayerList(room) });

  console.log(`[SALA] Sala ${code} creada por ${hostName}`);
  return code;
}

export function joinRoom(socket, code, playerName) {
  const room = rooms.get(code.toUpperCase());
  if (!room) {
    socket.emit('error', { mensaje: 'La sala no existe. Verifica el codigo.' });
    return false;
  }

  if (room.gameStarted) {
    socket.emit('error', { mensaje: 'La partida ya empezo en esta sala.' });
    return false;
  }

  if (room.players.size >= 8) {
    socket.emit('error', { mensaje: 'La sala esta llena (maximo 8 jugadores).' });
    return false;
  }

  const playerId = uuidv4();
  const player = {
    id: playerId,
    name: playerName,
    socket,
    isHost: false,
    disconnectTimer: null,
    lastSocketId: socket.id,
  };

  room.players.set(playerId, player);
  socket.joinRoom?.(code) ?? (socket.roomCode = code);

  broadcastPlayerList(room);
  console.log(`[SALA] ${playerName} se unio a la sala ${code}`);
  return true;
}

export function leaveRoom(socket) {
  for (const [code, room] of rooms) {
    for (const [playerId, player] of room.players) {
      if (player.socket === socket || player.lastSocketId === socket.id) {
        clearDisconnectTimer(player);

        room.players.delete(playerId);
        socket.emit('sala_actualizada', { jugadores: getPlayerList(room) });

        if (room.players.size === 0) {
          cleanupGame(room);
          rooms.delete(code);
          console.log(`[SALA] Sala ${code} eliminada (sin jugadores)`);
        } else {
          const wasHost = player.isHost;
          if (room.gameStarted) {
            broadcastToRoom(room, 'jugador_desconectado', { nombre: player.name });
            if (wasHost) {
              const firstPlayer = room.players.values().next().value;
              firstPlayer.isHost = true;
              if (firstPlayer.socket) {
                firstPlayer.socket.emit('nuevo_anfitrion');
              }
            }
          } else {
            if (wasHost && room.players.size > 0) {
              const firstPlayer = room.players.values().next().value;
              firstPlayer.isHost = true;
              if (firstPlayer.socket) {
                firstPlayer.socket.emit('nuevo_anfitrion');
              }
            }
          }
          broadcastPlayerList(room);
        }

        console.log(`[SALA] ${player.name} salio de la sala ${code}`);
        return true;
      }
    }
  }
  return false;
}

export function handleDisconnect(socket) {
  for (const room of rooms.values()) {
    for (const [playerId, player] of room.players) {
      if (player.socket === socket) {
        player.socket = null;
        player.lastSocketId = socket.id;

        player.disconnectTimer = setTimeout(() => {
          removePlayerAfterGrace(room, playerId);
        }, RECONNECT_GRACE_SECONDS * 1000);

        console.log(
          `[RECONEXION] ${player.name} se desconecto. Ventana de ${RECONNECT_GRACE_SECONDS}s iniciada.`,
        );
        return true;
      }
    }
  }
  return false;
}

export function handleReconnect(socket, playerId) {
  for (const room of rooms.values()) {
    for (const [pid, player] of room.players) {
      if (pid === playerId) {
        clearDisconnectTimer(player);
        player.socket = socket;
        player.lastSocketId = socket.id;

        socket.emit('sala_actualizada', {
          jugadores: getPlayerList(room),
          codigo_sala: room.code,
        });

        console.log(`[RECONEXION] ${player.name} se reconecto a la sala ${room.code}`);
        return room.code;
      }
    }
  }
  return null;
}

function removePlayerAfterGrace(room, playerId) {
  const player = room.players.get(playerId);
  if (!player) return;

  room.players.delete(playerId);
  console.log(`[RECONEXION] ${player.name} eliminado por abandono (60s)`);

  if (room.players.size === 0) {
    cleanupGame(room);
    rooms.delete(room.code);
    console.log(`[SALA] Sala ${room.code} eliminada (sin jugadores)`);
  } else {
    if (room.gameStarted) {
      broadcastToRoom(room, 'jugador_desconectado', { nombre: player.name });
    }
    broadcastPlayerList(room);
  }
}

function clearDisconnectTimer(player) {
  if (player.disconnectTimer) {
    clearTimeout(player.disconnectTimer);
    player.disconnectTimer = null;
  }
}

export function getPlayersInRoom(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return [];
  return getPlayerList(room);
}

export function getRoomByCode(code) {
  return rooms.get(code.toUpperCase()) ?? null;
}

export function getAllRooms() {
  const result = [];
  for (const [code, room] of rooms) {
    result.push({
      code,
      playerCount: room.players.size,
      gameStarted: room.gameStarted,
    });
  }
  return result;
}

function findRoomBySocket(socket) {
  for (const room of rooms.values()) {
    for (const player of room.players.values()) {
      if (player.socket === socket || player.lastSocketId === socket.id) {
        return { room, player };
      }
    }
  }
  return null;
}

export function startGame(socket) {
  const found = findRoomBySocket(socket);
  if (!found) {
    socket.emit('error', { mensaje: 'No estas en una sala.' });
    return;
  }

  const { room, player } = found;

  if (!player.isHost) {
    socket.emit('error', { mensaje: 'Solo el anfitrion puede iniciar la partida.' });
    return;
  }

  if (room.gameStarted) {
    socket.emit('error', { mensaje: 'La partida ya comenzo.' });
    return;
  }

  const playerList = [];
  for (const p of room.players.values()) {
    playerList.push(p);
  }

  if (playerList.length < 3) {
    socket.emit('error', { mensaje: 'Se necesitan al menos 3 jugadores.' });
    return;
  }

  room.gameStarted = true;
  initGame(room);

  console.log(
    `[PARTIDA] Sala ${room.code}: ${playerList.length} jug, ${room.game.impostorCount} impostores. Palabra: "${room.game.word}"`,
  );
  return true;
}

export function handleGiveClue(socket, clue) {
  const found = findRoomBySocket(socket);
  if (!found) return false;

  const { room, player } = found;
  return giveClue(room, player.id, clue);
}

export function handleCastVote(socket, targetId) {
  const found = findRoomBySocket(socket);
  if (!found) return false;

  const { room, player } = found;
  return castVote(room, player.id, targetId);
}

export function cleanupRoomGame(socket) {
  const found = findRoomBySocket(socket);
  if (found) {
    cleanupGame(found.room);
  }
}
