import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';

interface OnlinePlayer {
  id: string;
  name: string;
  isHost: boolean;
}

interface MyRoleInfo {
  jugador_id: string;
  nombre: string;
  rol: string;
  palabra: string;
  pista: string;
  referencia: string;
  total_jugadores: number;
  cantidad_impostores: number;
}

interface OnlineGameState {
  phase: 'pistas' | 'debate' | 'votacion' | 'votacion_resultado' | 'finalizado';
  roundNumber: number;
  currentTurn: string;
  totalPlayers: number;
  culpritCount: number;
  candidates: { id: string; nombre: string }[];
  votesCount: number;
  totalVoters: number;
  debateSeconds: number;
  voteSeconds: number;
  lastClue: { nombre: string; pista: string } | null;
  voteResult: VoteResult | null;
  gameResult: GameResult | null;
}

interface VoteResult {
  tipo: string;
  jugador_id?: string;
  nombre?: string;
  era_impostor?: boolean;
  votos?: number;
  total_votos?: number;
  mensaje?: string;
}

interface GameResult {
  ganadores: string;
  impostores: { id: string; nombre: string }[];
  honestos: { id: string; nombre: string }[];
  palabra: string;
  pista: string;
  referencia: string;
  ronda_final: number;
  jugadores_vivos: number;
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  serverUrl: string;
  roomCode: string | null;
  players: OnlinePlayer[];
  isHost: boolean;
  connectionError: string | null;
  gameStarted: boolean;
  myRole: MyRoleInfo | null;
  onlineGame: OnlineGameState | null;
  connectToServer: (url: string) => void;
  disconnectFromServer: () => void;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
  sendClue: (clue: string) => void;
  castVote: (playerId: string) => void;
  clearConnectionError: () => void;
  resetGameState: () => void;
}

const defaultGameState: OnlineGameState = {
  phase: 'pistas',
  roundNumber: 1,
  currentTurn: '',
  totalPlayers: 0,
  culpritCount: 0,
  candidates: [],
  votesCount: 0,
  totalVoters: 0,
  debateSeconds: 90,
  voteSeconds: 60,
  lastClue: null,
  voteResult: null,
  gameResult: null,
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return ctx;
}

const DEFAULT_URL = 'http://192.168.1.50:3000';

function setupSocketListeners(
  socket: Socket,
  handlers: {
    setIsConnected: (v: boolean) => void;
    setConnectionError: (v: string | null) => void;
    setRoomCode: (v: string | null) => void;
    setIsHost: (v: boolean) => void;
    setPlayers: (v: OnlinePlayer[]) => void;
    setMyRole: (v: MyRoleInfo | null) => void;
    setGameStarted: (v: boolean) => void;
    setOnlineGame: (
      v: OnlineGameState | null | ((prev: OnlineGameState | null) => OnlineGameState | null),
    ) => void;
  },
) {
  const {
    setIsConnected,
    setConnectionError,
    setRoomCode,
    setIsHost,
    setPlayers,
    setMyRole,
    setGameStarted,
    setOnlineGame,
  } = handlers;

  socket.on('connect', () => {
    setIsConnected(true);
    setConnectionError(null);
  });

  socket.on('disconnect', () => {
    setIsConnected(false);
  });

  socket.on('connect_error', (err) => {
    setConnectionError(`No se pudo conectar al servidor: ${err.message}`);
  });

  socket.on('sala_creada', (data: { codigo: string }) => {
    setRoomCode(data.codigo);
    setIsHost(true);
  });

  socket.on('lista_jugadores', (data: { jugadores: OnlinePlayer[] }) => {
    setPlayers(data.jugadores);
  });

  socket.on('sala_actualizada', (data: { jugadores: OnlinePlayer[] }) => {
    setPlayers(data.jugadores);
  });

  socket.on('error', (data: { mensaje: string }) => {
    setConnectionError(data.mensaje);
  });

  socket.on('asignar_rol', (data: MyRoleInfo) => {
    setMyRole(data);
    setGameStarted(true);
    setOnlineGame(
      (prev) =>
        prev ?? {
          ...defaultGameState,
          totalPlayers: data.total_jugadores,
          culpritCount: data.cantidad_impostores,
        },
    );
  });

  socket.on('inicio_ronda', (data) => {
    setOnlineGame((prev) => ({
      ...(prev ?? defaultGameState),
      roundNumber: data.ronda ?? 1,
      currentTurn: data.primer_orador,
      totalPlayers: data.total_jugadores,
      culpritCount: data.cantidad_impostores,
      phase: 'pistas',
      lastClue: null,
      voteResult: null,
    }));
  });

  socket.on('cambio_fase', (data: { fase: string; ronda: number }) => {
    setOnlineGame((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: data.fase as OnlineGameState['phase'],
        roundNumber: data.ronda,
        candidates: data.fase === 'votacion' ? prev.candidates : prev.candidates,
      };
    });
  });

  socket.on('cambio_turno', (data: { nombre: string }) => {
    setOnlineGame((prev) => {
      if (!prev) return prev;
      return { ...prev, currentTurn: data.nombre };
    });
  });

  socket.on('pista_dada', (data: { nombre: string; pista: string }) => {
    setOnlineGame((prev) => {
      if (!prev) return prev;
      return { ...prev, lastClue: data };
    });
  });

  socket.on('inicio_debate', (data: { segundos: number }) => {
    setOnlineGame((prev) => {
      if (!prev) return prev;
      return { ...prev, phase: 'debate', debateSeconds: data.segundos };
    });
  });

  socket.on('inicio_votacion', (data: { segundos: number; candidatos: { id: string; nombre: string }[] }) => {
    setOnlineGame((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: 'votacion',
        voteSeconds: data.segundos,
        candidates: data.candidatos,
        votesCount: 0,
        totalVoters: data.candidatos.length,
        voteResult: null,
      };
    });
  });

  socket.on('voto_registrado', (data: { total_votos: number; total_votantes: number }) => {
    setOnlineGame((prev) => {
      if (!prev) return prev;
      return { ...prev, votesCount: data.total_votos, totalVoters: data.total_votantes };
    });
  });

  socket.on('resultado_votacion', (data: VoteResult) => {
    setOnlineGame((prev) => {
      if (!prev) return prev;
      return { ...prev, phase: 'votacion_resultado', voteResult: data };
    });
  });

  socket.on('nueva_ronda', (data) => {
    setOnlineGame((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: 'pistas',
        roundNumber: data.ronda,
        currentTurn: '',
        lastClue: null,
        voteResult: null,
      };
    });
  });

  socket.on('fin_partida', (data: GameResult) => {
    setOnlineGame((prev) => {
      if (!prev) return prev;
      return { ...prev, phase: 'finalizado', gameResult: data };
    });
  });

  socket.on('jugador_desconectado', (data: { nombre: string }) => {
    setConnectionError(`${data.nombre} se desconecto de la partida.`);
  });
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [serverUrl, setServerUrl] = useState(DEFAULT_URL);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [myRole, setMyRole] = useState<MyRoleInfo | null>(null);
  const [onlineGame, setOnlineGame] = useState<OnlineGameState | null>(null);

  const connectToServer = useCallback((url: string) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;
    setServerUrl(url);
    setConnectionError(null);

    setupSocketListeners(socket, {
      setIsConnected,
      setConnectionError,
      setRoomCode,
      setIsHost,
      setPlayers,
      setMyRole,
      setGameStarted,
      setOnlineGame,
    });
  }, []);

  const disconnectFromServer = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setRoomCode(null);
    setPlayers([]);
    setIsHost(false);
    setConnectionError(null);
    setGameStarted(false);
    setMyRole(null);
    setOnlineGame(null);
  }, []);

  function createRoom(playerName: string) {
    const socket = socketRef.current;
    if (!socket) return;
    setConnectionError(null);
    setGameStarted(false);
    setMyRole(null);
    setOnlineGame(null);
    socket.emit('crear_sala', { nombre_jugador: playerName });
  }

  function joinRoom(code: string, playerName: string) {
    const socket = socketRef.current;
    if (!socket) return;
    setConnectionError(null);
    setGameStarted(false);
    setMyRole(null);
    setOnlineGame(null);
    socket.emit('unirse_sala', { codigo: code, nombre_jugador: playerName });
  }

  function leaveRoom() {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('salir_sala');
    setRoomCode(null);
    setPlayers([]);
    setIsHost(false);
    setGameStarted(false);
    setMyRole(null);
    setOnlineGame(null);
  }

  function startGame() {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('iniciar_partida');
  }

  function sendClue(clue: string) {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('enviar_pista', { pista: clue });
  }

  function castVote(playerId: string) {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('votar', { jugador_id: playerId });
  }

  function clearConnectionError() {
    setConnectionError(null);
  }

  function resetGameState() {
    setGameStarted(false);
    setMyRole(null);
    setOnlineGame(null);
  }

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        serverUrl,
        roomCode,
        players,
        isHost,
        connectionError,
        gameStarted,
        myRole,
        onlineGame,
        connectToServer,
        disconnectFromServer,
        createRoom,
        joinRoom,
        leaveRoom,
        startGame,
        sendClue,
        castVote,
        clearConnectionError,
        resetGameState,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
