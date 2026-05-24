import { io } from 'socket.io-client';

type Ack<T> = { ok: true; data: T } | { ok: false; error: string };
type PublicRoom = {
  code: string;
  players: { id: string; name: string; isHost: boolean }[];
};

const url = process.env.SERVER_URL ?? 'http://127.0.0.1:3001';

function connectClient() {
  return new Promise<ReturnType<typeof io>>((resolve, reject) => {
    const socket = io(url, { transports: ['websocket'], timeout: 3000 });
    const timeout = setTimeout(() => reject(new Error('Socket connection timed out')), 4000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      resolve(socket);
    });
    socket.on('connect_error', reject);
  });
}

function emitAck<T>(socket: ReturnType<typeof io>, event: string, payload?: unknown) {
  return new Promise<T>((resolve, reject) => {
    const callback = (response: Ack<T>) => {
      if (response.ok) resolve(response.data);
      else reject(new Error(response.error));
    };

    if (payload === undefined) socket.emit(event, callback);
    else socket.emit(event, payload, callback);
  });
}

async function main() {
  const host = await connectClient();
  const guest = await connectClient();
  const created = await emitAck<PublicRoom>(host, 'createRoom', { playerName: 'Host' });
  const joined = await emitAck<PublicRoom>(guest, 'joinRoom', {
    roomCode: created.code,
    playerName: 'Invitado',
  });

  if (joined.players.length !== 2) {
    throw new Error(`Expected 2 players, got ${joined.players.length}`);
  }

  await emitAck<{ left: true }>(guest, 'leaveRoom');
  await emitAck<{ left: true }>(host, 'leaveRoom');
  host.disconnect();
  guest.disconnect();
  console.log(`Smoke test passed for room ${created.code}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
