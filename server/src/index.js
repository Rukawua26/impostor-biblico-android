import { Server } from 'socket.io';
import { createServer } from 'http';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  handleDisconnect,
  handleReconnect,
  startGame,
  handleGiveClue,
  handleCastVote,
} from './roomManager.js';

const PORT = process.env.PORT ?? 3000;

const httpServer = createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', servicio: 'impostor-biblico-server' }));
    return;
  }
  res.writeHead(404);
  res.end();
});
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

io.on('connection', (socket) => {
  console.log(`[CONEXION] Cliente conectado: ${socket.id}`);

  socket.on('crear_sala', ({ nombre_jugador: name }) => {
    if (!name || name.trim().length === 0) {
      socket.emit('error', { mensaje: 'El nombre del jugador es obligatorio.' });
      return;
    }
    createRoom(socket, name.trim());
  });

  socket.on('unirse_sala', ({ codigo: code, nombre_jugador: name }) => {
    if (!code || code.trim().length === 0) {
      socket.emit('error', { mensaje: 'El codigo de sala es obligatorio.' });
      return;
    }
    if (!name || name.trim().length === 0) {
      socket.emit('error', { mensaje: 'El nombre del jugador es obligatorio.' });
      return;
    }
    joinRoom(socket, code.trim().toUpperCase(), name.trim());
  });

  socket.on('salir_sala', () => {
    leaveRoom(socket);
  });

  socket.on('iniciar_partida', () => {
    startGame(socket);
  });

  socket.on('enviar_pista', ({ pista: clue }) => {
    if (!clue || clue.trim().length === 0) return;
    handleGiveClue(socket, clue.trim());
  });

  socket.on('votar', ({ jugador_id: targetId }) => {
    if (!targetId) return;
    handleCastVote(socket, targetId);
  });

  socket.on('reconectar_sala', ({ jugador_id: playerId }) => {
    if (!playerId) return;
    const code = handleReconnect(socket, playerId);
    if (code) {
      socket.emit('reconexion_exitosa', { codigo_sala: code });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`[DESCONEXION] Cliente ${socket.id}: ${reason}`);
    handleDisconnect(socket);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] El Impostor Biblico - WebSocket corriendo en 0.0.0.0:${PORT}`);
});
