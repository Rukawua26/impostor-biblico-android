import { getRandomWord } from './bibleDeck.js';

const DEFAULT_DISCUSSION_SECONDS = 90;
const DEFAULT_VOTE_SECONDS = 60;
const DEFAULT_MAX_ROUNDS = 5;

export function initGame(room) {
  const wordEntry = getRandomWord();

  const playerList = [];
  for (const p of room.players.values()) {
    playerList.push(p);
  }

  const impostorCount = Math.max(1, Math.floor(playerList.length / 3));
  const shuffled = [...playerList].sort(() => Math.random() - 0.5);
  const impostorIds = new Set(shuffled.slice(0, impostorCount).map((p) => p.id));

  const turnOrder = [...playerList].sort(() => Math.random() - 0.5);

  room.game = {
    phase: 'pistas',
    word: wordEntry.word,
    clue: wordEntry.pista,
    reference: wordEntry.referencia,
    impostorIds,
    impostorCount,
    turnOrder,
    turnIndex: 0,
    pitchedIds: new Set(),
    votes: new Map(),
    eliminatedIds: new Set(),
    roundNumber: 1,
    maxRounds: DEFAULT_MAX_ROUNDS,
    discussionSeconds: DEFAULT_DISCUSSION_SECONDS,
    voteSeconds: DEFAULT_VOTE_SECONDS,
    timers: { debate: null, vote: null },
  };

  for (const p of playerList) {
    const isImpostor = impostorIds.has(p.id);
    if (p.socket) {
      p.socket.emit('asignar_rol', {
        jugador_id: p.id,
        nombre: p.name,
        rol: isImpostor ? 'Impostor' : 'Honesto',
        palabra: isImpostor ? '???' : wordEntry.word,
        pista: isImpostor ? '' : wordEntry.pista,
        referencia: isImpostor ? '' : wordEntry.referencia,
        total_jugadores: playerList.length,
        cantidad_impostores: impostorCount,
      });
    }
  }

  broadcastToRoom(room, 'inicio_ronda', {
    palabra: wordEntry.word,
    pista: wordEntry.pista,
    referencia: wordEntry.referencia,
    primer_orador: turnOrder[0].name,
    ronda: 1,
    rondas_totales: DEFAULT_MAX_ROUNDS,
    total_jugadores: playerList.length,
    cantidad_impostores: impostorCount,
  });

  broadcastToRoom(room, 'cambio_fase', { fase: 'pistas', ronda: 1 });
  broadcastToRoom(room, 'cambio_turno', { nombre: turnOrder[0].name });

  return true;
}

export function giveClue(room, playerId, clue) {
  if (!room.game || room.game.phase !== 'pistas') return false;

  const current = room.game.turnOrder[room.game.turnIndex];
  if (!current || current.id !== playerId) return false;

  if (room.game.pitchedIds.has(playerId)) return false;

  room.game.pitchedIds.add(playerId);

  broadcastToRoom(room, 'pista_dada', {
    nombre: current.name,
    pista: clue,
  });

  if (room.game.pitchedIds.size >= room.game.turnOrder.length) {
    startDebatePhase(room);
  } else {
    room.game.turnIndex = (room.game.turnIndex + 1) % room.game.turnOrder.length;
    while (room.game.pitchedIds.has(room.game.turnOrder[room.game.turnIndex].id)) {
      room.game.turnIndex = (room.game.turnIndex + 1) % room.game.turnOrder.length;
    }
    broadcastToRoom(room, 'cambio_turno', {
      nombre: room.game.turnOrder[room.game.turnIndex].name,
    });
  }

  return true;
}

function startDebatePhase(room) {
  room.game.phase = 'debate';
  broadcastToRoom(room, 'cambio_fase', { fase: 'debate', ronda: room.game.roundNumber });
  broadcastToRoom(room, 'inicio_debate', { segundos: room.game.discussionSeconds });

  room.game.timers.debate = setTimeout(() => {
    startVotingPhase(room);
  }, room.game.discussionSeconds * 1000);
}

function startVotingPhase(room) {
  clearTimer(room.game.timers.debate);
  room.game.phase = 'votacion';
  room.game.votes = new Map();

  const activePlayers = getActivePlayers(room);
  broadcastToRoom(room, 'cambio_fase', { fase: 'votacion', ronda: room.game.roundNumber });
  broadcastToRoom(room, 'inicio_votacion', {
    segundos: room.game.voteSeconds,
    candidatos: activePlayers.map((p) => ({ id: p.id, nombre: p.name })),
  });

  room.game.timers.vote = setTimeout(() => {
    finalizeVoting(room);
  }, room.game.voteSeconds * 1000);
}

export function castVote(room, voterId, targetId) {
  if (!room.game || room.game.phase !== 'votacion') return false;

  const voter = findPlayerById(room, voterId);
  if (!voter) return false;

  const target = findPlayerById(room, targetId);
  if (!target) return false;

  const active = getActivePlayers(room);
  if (!active.some((p) => p.id === targetId)) return false;

  if (room.game.eliminatedIds.has(voterId)) return false;

  room.game.votes.set(voterId, targetId);

  broadcastToRoom(room, 'voto_registrado', {
    total_votos: room.game.votes.size,
    total_votantes: active.length,
  });

  if (room.game.votes.size >= active.length) {
    clearTimer(room.game.timers.vote);
    finalizeVoting(room);
  }

  return true;
}

function finalizeVoting(room) {
  clearTimer(room.game.timers.vote);
  room.game.phase = 'votacion_resultado';

  const voteCount = new Map();
  for (const targetId of room.game.votes.values()) {
    voteCount.set(targetId, (voteCount.get(targetId) ?? 0) + 1);
  }

  let maxVotes = 0;
  let eliminatedId = null;
  let tie = false;

  for (const [id, count] of voteCount) {
    if (count > maxVotes) {
      maxVotes = count;
      eliminatedId = id;
      tie = false;
    } else if (count === maxVotes) {
      tie = true;
    }
  }

  let resultado;
  if (!eliminatedId || tie || maxVotes === 0) {
    resultado = { tipo: 'sin_eliminacion', mensaje: 'No hay suficientes votos para eliminar a alguien.' };
  } else {
    room.game.eliminatedIds.add(eliminatedId);
    const eliminated = findPlayerById(room, eliminatedId);
    const wasImpostor = room.game.impostorIds.has(eliminatedId);
    resultado = {
      tipo: 'eliminado',
      jugador_id: eliminatedId,
      nombre: eliminated?.name ?? 'Desconocido',
      era_impostor: wasImpostor,
      votos: maxVotes,
      total_votos: room.game.votes.size,
    };
  }

  broadcastToRoom(room, 'resultado_votacion', resultado);

  setTimeout(() => {
    checkGameEnd(room);
  }, 5000);
}

function checkGameEnd(room) {
  const active = getActivePlayers(room);
  const aliveImpostors = active.filter((p) => room.game.impostorIds.has(p.id));
  const aliveHonest = active.filter((p) => !room.game.impostorIds.has(p.id));

  if (aliveImpostors.length === 0) {
    endGame(room, 'honestos');
    return;
  }

  if (aliveImpostors.length >= aliveHonest.length) {
    endGame(room, 'impostores');
    return;
  }

  if (room.game.roundNumber >= room.game.maxRounds) {
    endGame(room, 'impostores');
    return;
  }

  startNextRound(room);
}

function startNextRound(room) {
  room.game.roundNumber++;
  room.game.phase = 'pistas';
  room.game.pitchedIds = new Set();
  room.game.votes = new Map();

  const active = getActivePlayers(room);
  const nextSpeaker = active[Math.floor(Math.random() * active.length)];

  room.game.turnOrder = [...active].sort(() => Math.random() - 0.5);
  room.game.turnIndex = 0;
  const firstInTurn = room.game.turnOrder[0];

  broadcastToRoom(room, 'nueva_ronda', {
    ronda: room.game.roundNumber,
    rondas_totales: room.game.maxRounds,
    jugadores_vivos: active.length,
  });

  broadcastToRoom(room, 'cambio_fase', { fase: 'pistas', ronda: room.game.roundNumber });
  broadcastToRoom(room, 'cambio_turno', { nombre: firstInTurn.name });
}

function endGame(room, winner) {
  room.game.phase = 'finalizado';
  clearTimer(room.game.timers.debate);
  clearTimer(room.game.timers.vote);

  const active = getActivePlayers(room);
  const impostorPlayers = [];
  const honestPlayers = [];

  for (const p of room.players.values()) {
    if (room.game.impostorIds.has(p.id)) {
      impostorPlayers.push({ id: p.id, nombre: p.name });
    } else {
      honestPlayers.push({ id: p.id, nombre: p.name });
    }
  }

  broadcastToRoom(room, 'fin_partida', {
    ganadores: winner,
    impostores: impostorPlayers,
    honestos: honestPlayers,
    palabra: room.game.word,
    pista: room.game.clue,
    referencia: room.game.reference,
    ronda_final: room.game.roundNumber,
    jugadores_vivos: active.length,
  });
}

function clearTimer(timer) {
  if (timer) {
    clearTimeout(timer);
  }
}

function findPlayerById(room, id) {
  for (const p of room.players.values()) {
    if (p.id === id) return p;
  }
  return null;
}

function getActivePlayers(room) {
  const active = [];
  for (const p of room.players.values()) {
    if (!room.game.eliminatedIds.has(p.id)) {
      active.push(p);
    }
  }
  return active;
}

function broadcastToRoom(room, event, data) {
  for (const p of room.players.values()) {
    if (p.socket) {
      p.socket.emit(event, data);
    }
  }
}

export function cleanupGame(room) {
  if (room.game) {
    clearTimer(room.game.timers.debate);
    clearTimer(room.game.timers.vote);
    room.game = null;
  }
}
