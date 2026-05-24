import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createRoom, joinRoom, listRooms, removePlayer, toPublicRoom } from './rooms.js';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './types.js';

const app = express();
const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  server,
  {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  },
);
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ ok: true, rooms: listRooms().length });
});

app.get('/rooms', (_request, response) => {
  response.json({ rooms: listRooms() });
});

function emitRoom(roomCode: string) {
  const room = listRooms().find((item) => item.code === roomCode);

  if (room) io.to(roomCode).emit('roomUpdated', room);
}

io.on('connection', (socket) => {
  socket.on('createRoom', (payload, callback) => {
    try {
      if (socket.data.roomCode) socket.leave(socket.data.roomCode);

      const room = createRoom(socket.id, payload.playerName);
      socket.data.roomCode = room.code;
      socket.data.playerName = payload.playerName.trim();
      socket.join(room.code);

      callback({ ok: true, data: toPublicRoom(room) });
      emitRoom(room.code);
    } catch (error) {
      callback({ ok: false, error: error instanceof Error ? error.message : 'No se pudo crear la sala.' });
    }
  });

  socket.on('joinRoom', (payload, callback) => {
    try {
      if (socket.data.roomCode) socket.leave(socket.data.roomCode);

      const room = joinRoom(payload.roomCode, socket.id, payload.playerName);
      socket.data.roomCode = room.code;
      socket.data.playerName = payload.playerName.trim();
      socket.join(room.code);

      callback({ ok: true, data: toPublicRoom(room) });
      emitRoom(room.code);
    } catch (error) {
      callback({ ok: false, error: error instanceof Error ? error.message : 'No se pudo unir a la sala.' });
    }
  });

  socket.on('leaveRoom', (callback) => {
    if (typeof callback !== 'function') return;

    const roomCode = socket.data.roomCode;

    if (roomCode) {
      const result = removePlayer(roomCode, socket.id);
      socket.leave(roomCode);
      socket.data.roomCode = undefined;
      socket.data.playerName = undefined;

      if (result.room) io.to(roomCode).emit('roomUpdated', toPublicRoom(result.room));
    }

    callback({ ok: true, data: { left: true } });
  });

  socket.on('disconnect', () => {
    const roomCode = socket.data.roomCode;

    if (!roomCode) return;

    const result = removePlayer(roomCode, socket.id);

    if (result.removed && result.room) {
      io.to(roomCode).emit('playerDisconnected', {
        playerId: result.removed.id,
        playerName: result.removed.name,
      });
      io.to(roomCode).emit('roomUpdated', toPublicRoom(result.room));
    }
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Network server listening on port ${port}`);
});
