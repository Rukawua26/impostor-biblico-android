import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import type { Colors } from '../theme/colors';
import { Button } from './ui/Button';

interface Props {
  onLeave: () => void;
}

export function OnlineGameScreen({ onLeave }: Props) {
  const { colors } = useTheme();
  const { myRole, onlineGame, sendClue, castVote } = useSocket();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [clueText, setClueText] = useState('');
  const [myVote, setMyVote] = useState<string | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [onlineGame?.phase, fadeAnim]);

  if (!myRole || !onlineGame) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[{ color: colors.onSurface, fontSize: 16 }]}>Cargando partida...</Text>
      </View>
    );
  }

  const isMyTurn = onlineGame.currentTurn === myRole.nombre;
  const isImpostor = myRole.rol === 'Impostor';

  function handleSendClue() {
    if (!clueText.trim()) return;
    sendClue(clueText.trim());
    setClueText('');
  }

  function handleVote(playerId: string) {
    setMyVote(playerId);
    castVote(playerId);
  }

  const phaseTitle = useMemo(() => {
    switch (onlineGame.phase) {
      case 'pistas':
        return `Ronda ${onlineGame.roundNumber} - Pistas`;
      case 'debate':
        return `Ronda ${onlineGame.roundNumber} - Debate`;
      case 'votacion':
        return `Ronda ${onlineGame.roundNumber} - Votacion`;
      case 'votacion_resultado':
        return 'Resultado de la votacion';
      case 'finalizado':
        return 'Partida finalizada';
    }
  }, [onlineGame.phase, onlineGame.roundNumber]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surfaceContainer }]}>
        <Text style={[styles.phaseTitle, { color: colors.primary }]}>{phaseTitle}</Text>
        <View style={styles.roleRow}>
          <Text style={[styles.roleLabel, { color: colors.onSurfaceVariant }]}>Tu rol:</Text>
          <Text style={[styles.roleValue, { color: isImpostor ? '#F44336' : '#4CAF50' }]}>{myRole.rol}</Text>
        </View>
        {myRole.palabra && (
          <Text style={[styles.wordText, { color: colors.onSurface }]}>Palabra: {myRole.palabra}</Text>
        )}
        {myRole.referencia && (
          <Text style={[styles.referenceText, { color: colors.onSurfaceVariant }]}>
            Referencia: {myRole.referencia}
          </Text>
        )}
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {onlineGame.phase === 'pistas' && (
          <PistasPhase
            isMyTurn={isMyTurn}
            currentTurn={onlineGame.currentTurn}
            clueText={clueText}
            onChangeClue={setClueText}
            onSendClue={handleSendClue}
            lastClue={onlineGame.lastClue}
            colors={colors}
          />
        )}

        {onlineGame.phase === 'debate' && <DebatePhase seconds={onlineGame.debateSeconds} colors={colors} />}

        {onlineGame.phase === 'votacion' && (
          <VotacionPhase
            candidates={onlineGame.candidates}
            myVote={myVote}
            votesCount={onlineGame.votesCount}
            totalVoters={onlineGame.totalVoters}
            isImpostor={isImpostor}
            onVote={handleVote}
            colors={colors}
          />
        )}

        {onlineGame.phase === 'votacion_resultado' && onlineGame.voteResult && (
          <VoteResultPhase result={onlineGame.voteResult} colors={colors} />
        )}

        {onlineGame.phase === 'finalizado' && onlineGame.gameResult && (
          <GameOverPhase result={onlineGame.gameResult} onLeave={onLeave} colors={colors} />
        )}
      </Animated.View>
    </View>
  );
}

function PistasPhase({
  isMyTurn,
  currentTurn,
  clueText,
  onChangeClue,
  onSendClue,
  lastClue,
  colors,
}: {
  isMyTurn: boolean;
  currentTurn: string;
  clueText: string;
  onChangeClue: (t: string) => void;
  onSendClue: () => void;
  lastClue: { nombre: string; pista: string } | null;
  colors: Colors;
}) {
  return (
    <View style={styles.phaseContainer}>
      <View style={[styles.turnBox, { backgroundColor: isMyTurn ? '#4CAF5022' : colors.surfaceContainer }]}>
        <Text style={[styles.turnLabel, { color: colors.onSurfaceVariant }]}>Turno de:</Text>
        <Text style={[styles.turnName, { color: colors.primary }]}>{currentTurn}</Text>
      </View>

      {isMyTurn && (
        <View style={styles.clueInputArea}>
          <Text style={[styles.clueInstruction, { color: colors.onSurfaceVariant }]}>
            Da tu pista (una palabra o frase corta):
          </Text>
          <TextInput
            style={[
              styles.clueInput,
              {
                backgroundColor: colors.surfaceContainer,
                color: colors.onSurface,
                borderColor: colors.outline,
              },
            ]}
            value={clueText}
            onChangeText={onChangeClue}
            placeholder="Escribe tu pista..."
            placeholderTextColor={colors.onSurfaceVariant}
            maxLength={60}
          />
          <Button title="Enviar pista" onPress={onSendClue} variant="primary" disabled={!clueText.trim()} />
        </View>
      )}

      {!isMyTurn && (
        <Text style={[styles.waitText, { color: colors.onSurfaceVariant }]}>
          Espera tu turno para dar tu pista...
        </Text>
      )}

      {lastClue && (
        <Text style={[styles.lastClueText, { color: colors.onSurfaceVariant }]}>
          {lastClue.nombre} dio su pista.
        </Text>
      )}
    </View>
  );
}

function DebatePhase({ seconds, colors }: { seconds: number; colors: Colors }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const minutes = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <View style={styles.phaseContainer}>
      <Text style={[styles.debateTitle, { color: colors.onSurface }]}>Tiempo de debate</Text>
      <Text style={[styles.timer, { color: timeLeft < 30 ? '#F44336' : colors.primary }]}>
        {minutes}:{secs.toString().padStart(2, '0')}
      </Text>
      <Text style={[styles.debateHint, { color: colors.onSurfaceVariant }]}>
        Discutan las pistas y decidan quien puede ser el impostor.
      </Text>
    </View>
  );
}

function VotacionPhase({
  candidates,
  myVote,
  votesCount,
  totalVoters,
  isImpostor,
  onVote,
  colors,
}: {
  candidates: { id: string; nombre: string }[];
  myVote: string | null;
  votesCount: number;
  totalVoters: number;
  isImpostor: boolean;
  onVote: (id: string) => void;
  colors: Colors;
}) {
  return (
    <View style={styles.phaseContainer}>
      <Text style={[styles.voteTitle, { color: colors.onSurface }]}>Votacion</Text>
      <Text style={[styles.voteCount, { color: colors.onSurfaceVariant }]}>
        Votos: {votesCount} / {totalVoters}
      </Text>
      <Text style={[styles.voteHint, { color: colors.onSurfaceVariant }]}>
        {isImpostor
          ? 'Vota contra alguien que no sea tu companero impostor.'
          : 'Elige a quien crees que es el impostor.'}
      </Text>
      <View style={styles.candidateList}>
        {candidates.map((candidate) => {
          const isSelected = myVote === candidate.id;
          return (
            <Button
              key={candidate.id}
              title={candidate.nombre}
              onPress={() => onVote(candidate.id)}
              variant={isSelected ? 'secondary' : 'outline'}
              disabled={myVote !== null}
            />
          );
        })}
      </View>
      {myVote && <Text style={[styles.voteConfirm, { color: '#4CAF50' }]}>Voto registrado</Text>}
    </View>
  );
}

function VoteResultPhase({
  result,
  colors,
}: {
  result: {
    tipo: string;
    nombre?: string;
    era_impostor?: boolean;
    votos?: number;
    total_votos?: number;
    mensaje?: string;
  };
  colors: Colors;
}) {
  return (
    <View style={styles.phaseContainer}>
      {result.tipo === 'sin_eliminacion' && (
        <>
          <Text style={[styles.resultTitle, { color: colors.onSurface }]}>Empate</Text>
          <Text style={[styles.resultText, { color: colors.onSurfaceVariant }]}>{result.mensaje}</Text>
        </>
      )}
      {result.tipo === 'eliminado' && (
        <>
          <Text style={[styles.resultTitle, { color: colors.onSurface }]}>{result.nombre} fue eliminado</Text>
          {result.era_impostor ? (
            <Text style={[styles.resultText, { color: '#4CAF50', fontWeight: '700' }]}>
              Era impostor! Bien hecho!
            </Text>
          ) : (
            <Text style={[styles.resultText, { color: '#F44336', fontWeight: '700' }]}>
              Era honesto... Sigan intentando.
            </Text>
          )}
          <Text style={[styles.resultVotes, { color: colors.onSurfaceVariant }]}>
            Votos: {result.votos} de {result.total_votos}
          </Text>
        </>
      )}
      <Text style={[styles.waitContinue, { color: colors.onSurfaceVariant }]}>Continuando...</Text>
    </View>
  );
}

function GameOverPhase({
  result,
  onLeave,
  colors,
}: {
  result: {
    ganadores: string;
    palabra: string;
    pista: string;
    referencia: string;
    impostores: { id: string; nombre: string }[];
    honestos: { id: string; nombre: string }[];
  };
  onLeave: () => void;
  colors: Colors;
}) {
  const isImpostorWin = result.ganadores === 'impostores';

  return (
    <View style={[styles.phaseContainer, styles.gameOverContainer]}>
      <Text style={[styles.gameOverTitle, { color: isImpostorWin ? '#F44336' : '#4CAF50' }]}>
        {isImpostorWin ? 'Impostores ganan!' : 'Honestos ganan!'}
      </Text>

      <View style={[styles.resultBox, { backgroundColor: colors.surfaceContainer }]}>
        <Text style={[styles.resultLabel, { color: colors.onSurfaceVariant }]}>La palabra era:</Text>
        <Text style={[styles.resultWord, { color: colors.onSurface }]}>{result.palabra}</Text>
        <Text style={[styles.resultClue, { color: colors.onSurfaceVariant }]}>Pista: {result.pista}</Text>
        <Text style={[styles.resultRef, { color: colors.onSurfaceVariant }]}>Ref: {result.referencia}</Text>
      </View>

      <View style={[styles.resultBox, { backgroundColor: colors.surfaceContainer }]}>
        <Text style={[styles.resultLabel, { color: '#F44336' }]}>Impostores:</Text>
        {result.impostores.map((imp: { id: string; nombre: string }) => (
          <Text key={imp.id} style={[styles.playerName, { color: colors.onSurface }]}>
            {imp.nombre}
          </Text>
        ))}
      </View>

      <View style={[styles.resultBox, { backgroundColor: colors.surfaceContainer }]}>
        <Text style={[styles.resultLabel, { color: '#4CAF50' }]}>Honestos:</Text>
        {result.honestos.map((hon: { id: string; nombre: string }) => (
          <Text key={hon.id} style={[styles.playerName, { color: colors.onSurface }]}>
            {hon.nombre}
          </Text>
        ))}
      </View>

      <View style={styles.gameOverButtons}>
        <Button title="Salir de la partida" onPress={onLeave} variant="outline" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 48,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  phaseTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 14,
  },
  roleValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  wordText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  referenceText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  phaseContainer: {
    flex: 1,
    paddingTop: 24,
  },
  turnBox: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  turnLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  turnName: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  clueInputArea: {
    gap: 12,
  },
  clueInstruction: {
    fontSize: 14,
    textAlign: 'center',
  },
  clueInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    textAlign: 'center',
  },
  waitText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 40,
  },
  lastClueText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
  debateTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  timer: {
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    marginBottom: 16,
  },
  debateHint: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  voteTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  voteCount: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  voteHint: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  candidateList: {
    gap: 8,
  },
  voteConfirm: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  resultVotes: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  waitContinue: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 32,
  },
  gameOverContainer: {
    gap: 16,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  resultBox: {
    borderRadius: 12,
    padding: 14,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultWord: {
    fontSize: 18,
    fontWeight: '800',
  },
  resultClue: {
    fontSize: 14,
    marginTop: 2,
  },
  resultRef: {
    fontSize: 12,
    marginTop: 2,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  gameOverButtons: {
    marginTop: 20,
  },
});
