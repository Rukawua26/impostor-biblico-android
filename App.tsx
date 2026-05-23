import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { defaultPlayers } from './src/data/defaultPlayers';
import { createRound, normalizePlayers } from './src/game/createRound';
import type { GameResult, GameSettings, Phase, Player, Round } from './src/types/game';

type VoteTally = {
  playerId: number;
  name: string;
  votes: number;
};

const defaultSettings: GameSettings = {
  discussionSeconds: 90,
  voteSeconds: 30,
  maxRounds: 5,
};

export default function App() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [allPlayers, setAllPlayers] = useState<Player[]>(defaultPlayers);
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [round, setRound] = useState<Round | null>(null);
  const [revealIndex, setRevealIndex] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);
  const [selectedVoteId, setSelectedVoteId] = useState<number | null>(null);
  const [discussionTimeLeft, setDiscussionTimeLeft] = useState(0);
  const [voteTimeLeft, setVoteTimeLeft] = useState(0);
  const [setupMessage, setSetupMessage] = useState('');
  const [roundNumber, setRoundNumber] = useState(1);
  const [eliminatedIds, setEliminatedIds] = useState<number[]>([]);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [eliminatedPlayerName, setEliminatedPlayerName] = useState('');
  const [voterIndex, setVoterIndex] = useState(0);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [eligibleVoteIds, setEligibleVoteIds] = useState<number[] | null>(null);
  const [voteMessage, setVoteMessage] = useState('');
  const [voteTally, setVoteTally] = useState<VoteTally[]>([]);

  const impostorPlayer = activePlayers.find((player) => player.id === round?.impostorId);
  const currentPlayer = activePlayers[revealIndex];
  const currentVoter = activePlayers[voterIndex];
  const selectedPlayer = activePlayers.find((player) => player.id === selectedVoteId);
  const normalizedAll = useMemo(() => normalizePlayers(allPlayers), [allPlayers]);
  const canStart = normalizedAll.length >= 3;
  const visibleEliminatedIds = useMemo(() => {
    if (selectedVoteId && selectedVoteId !== round?.impostorId) {
      return [...new Set([...eliminatedIds, selectedVoteId])];
    }

    return eliminatedIds;
  }, [eliminatedIds, round?.impostorId, selectedVoteId]);
  const visibleEliminatedPlayers = allPlayers.filter((player) =>
    visibleEliminatedIds.includes(player.id),
  );
  const visibleActivePlayers = activePlayers.filter(
    (player) => !visibleEliminatedIds.includes(player.id),
  );
  const voteCandidates = activePlayers.filter((player) => {
    if (!eligibleVoteIds) return true;

    return eligibleVoteIds.includes(player.id);
  });

  useEffect(() => {
    if (phase !== 'discussion' || discussionTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setDiscussionTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [discussionTimeLeft, phase]);

  useEffect(() => {
    if (phase !== 'vote' || voteTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setVoteTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, voteTimeLeft]);

  const subtitle = useMemo(() => {
    if (phase === 'setup') return 'Configura jugadores y la partida.';
    if (phase === 'rules') return 'Lee las reglas antes de empezar.';
    if (phase === 'reveal') return 'Pasa el telefono para ver roles en secreto.';
    if (phase === 'discussion') return `Ronda ${roundNumber} de ${settings.maxRounds}`;
    if (phase === 'vote') return 'El grupo decide quien es el impostor.';
    if (phase === 'eliminated') return `${eliminatedPlayerName} fue eliminado.`;
    if (gameResult === 'innocents') return 'El grupo gano la partida.';
    if (gameResult === 'impostor') return 'El impostor gano la partida.';
    return '';
  }, [phase, roundNumber, settings.maxRounds, eliminatedPlayerName, gameResult]);

  function updatePlayerName(id: number, name: string) {
    setAllPlayers((current) =>
      current.map((player) => (player.id === id ? { ...player, name } : player)),
    );
    setSetupMessage('');
  }

  function addPlayer() {
    setAllPlayers((current) => [
      ...current,
      { id: Date.now(), name: `Jugador ${current.length + 1}` },
    ]);
  }

  function removePlayer(id: number) {
    setAllPlayers((current) => current.filter((player) => player.id !== id));
    setSetupMessage('');
  }

  function startGame() {
    const players = normalizePlayers(allPlayers);

    if (players.length < 3) {
      setSetupMessage('Necesitas al menos 3 jugadores con nombres distintos.');
      return;
    }

    setAllPlayers(players);
    setActivePlayers(players);
    setRound(createRound(players));
    setRevealIndex(0);
    setCardVisible(false);
    setSelectedVoteId(null);
    setDiscussionTimeLeft(settings.discussionSeconds);
    setVoteTimeLeft(settings.voteSeconds);
    setRoundNumber(1);
    setEliminatedIds([]);
    setGameResult(null);
    setEliminatedPlayerName('');
    setVoterIndex(0);
    setVotes({});
    setEligibleVoteIds(null);
    setVoteMessage('');
    setVoteTally([]);
    setPhase('rules');
  }

  function beginReveal() {
    setPhase('reveal');
  }

  function continueReveal() {
    if (!cardVisible) {
      setCardVisible(true);
      return;
    }

    if (revealIndex === activePlayers.length - 1) {
      setPhase('discussion');
      setCardVisible(false);
      setDiscussionTimeLeft(settings.discussionSeconds);
      return;
    }

    setRevealIndex((current) => current + 1);
    setCardVisible(false);
  }

  function goToVote() {
    setVoteTimeLeft(settings.voteSeconds);
    setSelectedVoteId(null);
    setVoterIndex(0);
    setVotes({});
    setEligibleVoteIds(null);
    setVoteMessage('');
    setVoteTally([]);
    setPhase('vote');
  }

  function finishVoting(finalVotes: Record<number, number>) {
    const tally = voteCandidates
      .map((player) => ({
        playerId: player.id,
        name: player.name,
        votes: Object.values(finalVotes).filter((voteId) => voteId === player.id).length,
      }))
      .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name));
    const maxVotes = tally[0]?.votes ?? 0;
    const tiedPlayers = tally.filter((item) => item.votes === maxVotes);

    setVoteTally(tally);

    if (tiedPlayers.length > 1) {
      setVotes({});
      setVoterIndex(0);
      setSelectedVoteId(null);
      setEligibleVoteIds(tiedPlayers.map((player) => player.playerId));
      setVoteTimeLeft(settings.voteSeconds);
      setVoteMessage(`Empate entre ${tiedPlayers.map((player) => player.name).join(', ')}. Voten de nuevo solo entre ellos.`);
      return;
    }

    handleVoteResult(tiedPlayers[0].playerId);
  }

  function submitVote() {
    if (!currentVoter || !selectedVoteId) return;

    const nextVotes = { ...votes, [currentVoter.id]: selectedVoteId };

    if (voterIndex < activePlayers.length - 1) {
      setVotes(nextVotes);
      setVoterIndex((current) => current + 1);
      setSelectedVoteId(null);
      return;
    }

    setVotes(nextVotes);
    finishVoting(nextVotes);
  }

  function handleVoteResult(eliminatedId: number) {
    setSelectedVoteId(eliminatedId);

    if (eliminatedId === round?.impostorId) {
      setGameResult('innocents');
      setPhase('result');
      return;
    }

    const eliminated = activePlayers.find((player) => player.id === eliminatedId);
    setEliminatedPlayerName(eliminated?.name ?? '');

    if (roundNumber >= settings.maxRounds) {
      setGameResult('impostor');
      setPhase('result');
      return;
    }

    setPhase('eliminated');
  }

  function nextRound() {
    const remaining = activePlayers.filter((player) => player.id !== selectedVoteId);

    if (remaining.length <= 2) {
      setGameResult('impostor');
      setPhase('result');
      return;
    }

    setEliminatedIds((current) => [
      ...current,
      ...(selectedVoteId ? [selectedVoteId] : []),
    ]);
    setActivePlayers(remaining);
    setRoundNumber((current) => current + 1);
    setDiscussionTimeLeft(settings.discussionSeconds);
    setCardVisible(false);
    setSelectedVoteId(null);
    setVoterIndex(0);
    setVotes({});
    setEligibleVoteIds(null);
    setVoteMessage('');
    setPhase('discussion');
  }

  function resetGame() {
    setPhase('setup');
    setRevealIndex(0);
    setCardVisible(false);
    setSelectedVoteId(null);
    setRound(null);
    setSetupMessage('');
    setRoundNumber(1);
    setEliminatedIds([]);
    setGameResult(null);
    setEliminatedPlayerName('');
    setVoterIndex(0);
    setVotes({});
    setEligibleVoteIds(null);
    setVoteMessage('');
    setVoteTally([]);
  }

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'android' ? undefined : 'padding'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.kicker}>Juego presencial multijugador</Text>
          <Text style={styles.title}>El Impostor Biblico</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        {phase === 'setup' && (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Jugadores</Text>
              <Text style={styles.helperText}>
                Minimo 3. Los nombres repetidos se ignoran.
              </Text>
              {allPlayers.map((player, index) => (
                <View key={player.id} style={styles.playerRow}>
                  <TextInput
                    style={styles.input}
                    value={player.name}
                    placeholder={`Jugador ${index + 1}`}
                    placeholderTextColor="#607D8B"
                    returnKeyType="done"
                    onChangeText={(name) => updatePlayerName(player.id, name)}
                  />
                  {allPlayers.length > 3 && (
                    <Pressable
                      style={styles.smallButton}
                      onPress={() => removePlayer(player.id)}
                    >
                      <Text style={styles.smallButtonText}>X</Text>
                    </Pressable>
                  )}
                </View>
              ))}
              <Pressable style={styles.secondaryButton} onPress={addPlayer}>
                <Text style={styles.secondaryButtonText}>Agregar jugador</Text>
              </Pressable>
              {setupMessage ? (
                <Text style={styles.warningText}>{setupMessage}</Text>
              ) : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Configuracion</Text>

              <Text style={styles.settingLabel}>Tiempo de discusion (segundos)</Text>
              <TextInput
                style={styles.input}
                value={String(settings.discussionSeconds)}
                onChangeText={(text) => {
                  const num = parseInt(text, 10);
                  if (!isNaN(num) && num > 0) {
                    setSettings((prev) => ({ ...prev, discussionSeconds: num }));
                  }
                }}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder="90"
                placeholderTextColor="#607D8B"
              />

              <Text style={styles.settingLabel}>Tiempo de votacion (segundos)</Text>
              <TextInput
                style={styles.input}
                value={String(settings.voteSeconds)}
                onChangeText={(text) => {
                  const num = parseInt(text, 10);
                  if (!isNaN(num) && num > 0) {
                    setSettings((prev) => ({ ...prev, voteSeconds: num }));
                  }
                }}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder="30"
                placeholderTextColor="#607D8B"
              />

              <Text style={styles.settingLabel}>Rondas maximas</Text>
              <TextInput
                style={styles.input}
                value={String(settings.maxRounds)}
                onChangeText={(text) => {
                  const num = parseInt(text, 10);
                  if (!isNaN(num) && num >= 1 && num <= 10) {
                    setSettings((prev) => ({ ...prev, maxRounds: num }));
                  }
                }}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder="5"
                placeholderTextColor="#607D8B"
              />

              <Pressable
                style={[styles.primaryButton, !canStart && styles.disabledButton]}
                disabled={!canStart}
                onPress={startGame}
              >
                <Text style={styles.primaryButtonText}>Iniciar partida</Text>
              </Pressable>
            </View>
          </>
        )}

        {phase === 'rules' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Como se juega</Text>
            <Text style={styles.ruleText}>
              1. Un jugador sera el impostor y no vera la historia biblica.
            </Text>
            <Text style={styles.ruleText}>
              2. Los demas jugadores ven la misma historia solo una vez y deben
              memorizarla.
            </Text>
            <Text style={styles.ruleText}>
              3. Cada jugador da pistas sin decir la frase exacta.
            </Text>
            <Text style={styles.ruleText}>
              4. En cada votacion, cada jugador vota en secreto desde el mismo
              telefono.
            </Text>
            <Text style={styles.ruleText}>
              5. Si el mas votado es el impostor, el grupo gana.
            </Text>
            <Text style={styles.ruleText}>
              6. Si votan a un inocente, ese jugador queda eliminado y la
              siguiente ronda empieza sin volver a mostrar la palabra.
            </Text>
            <Text style={styles.ruleText}>
              7. Si hay empate, se repite la votacion solo entre empatados.
            </Text>
            <Text style={styles.ruleText}>
              8. Si el impostor sobrevive {settings.maxRounds} rondas, gana la
              partida.
            </Text>
            <Pressable style={styles.primaryButton} onPress={beginReveal}>
              <Text style={styles.primaryButtonText}>Entendido</Text>
            </Pressable>
          </View>
        )}

        {phase === 'reveal' && currentPlayer && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Turno de {currentPlayer.name}
            </Text>
            <Text style={styles.helperText}>
              Solo esta persona debe mirar la pantalla.
            </Text>
            <View style={styles.roleCard}>
              {cardVisible ? (
                currentPlayer.id === round?.impostorId ? (
                  <>
                    <Text style={styles.roleLabel}>Tu eres el IMPOSTOR</Text>
                    <Text style={styles.impostorText}>Impostor</Text>
                    <Text style={styles.roleHint}>
                      No sabes cual es la historia. Escucha a los demas y finge.
                    </Text>
                    <View style={styles.phraseCard}>
                      <Text style={styles.phraseLabel}>
                        Frase para comenzar:
                      </Text>
                      <Text style={styles.phraseText}>
                        {round?.impostorPhrase}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.roleLabel}>Historia biblica</Text>
                    <Text style={styles.wordText}>{round?.word}</Text>
                    <Text style={styles.roleHint}>
                      Da pistas sin decir la frase exacta.
                    </Text>
                  </>
                )
              ) : (
                <>
                  <Text style={styles.roleLabel}>Pantalla oculta</Text>
                  <Text style={styles.hiddenText}>
                    Solo {currentPlayer.name} debe ver.
                  </Text>
                </>
              )}
            </View>
            <Pressable style={styles.primaryButton} onPress={continueReveal}>
              <Text style={styles.primaryButtonText}>
                {cardVisible ? 'Ocultar y pasar' : 'Ver mi rol'}
              </Text>
            </Pressable>
          </View>
        )}

        {phase === 'discussion' && (
          <View style={styles.card}>
            <View style={styles.roundBadge}>
              <Text style={styles.roundBadgeText}>
                Ronda {roundNumber} de {settings.maxRounds}
              </Text>
            </View>
            <Text style={styles.timerText}>{formatTime(discussionTimeLeft)}</Text>
            <Text style={styles.bodyText}>
              Cada jugador da una pista breve. El impostor debe fingir.
            </Text>
            <Text style={styles.helperText}>
              Tiempo restante de discusion. Pueden avanzar antes si todos estan
              listos.
            </Text>
            <View style={styles.listCard}>
              <Text style={styles.listTitle}>Jugadores activos</Text>
              <Text style={styles.listText}>
                {visibleActivePlayers.map((player) => player.name).join(', ')}
              </Text>
            </View>
            {visibleEliminatedPlayers.length > 0 && (
              <View style={styles.listCardMuted}>
                <Text style={styles.listTitle}>Eliminados</Text>
                <Text style={styles.listText}>
                  {visibleEliminatedPlayers.map((player) => player.name).join(', ')}
                </Text>
              </View>
            )}
            <Pressable style={styles.primaryButton} onPress={goToVote}>
              <Text style={styles.primaryButtonText}>Ir a votacion</Text>
            </Pressable>
          </View>
        )}

        {phase === 'vote' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Vota {currentVoter?.name}</Text>
            <Text style={styles.timerText}>{formatTime(voteTimeLeft)}</Text>
            <Text style={styles.helperText}>
              Voto {Math.min(voterIndex + 1, activePlayers.length)} de {activePlayers.length}. Pasa el telefono al jugador indicado.
            </Text>
            {voteMessage ? <Text style={styles.warningText}>{voteMessage}</Text> : null}
            {voteTally.length > 0 && (
              <View style={styles.listCard}>
                <Text style={styles.listTitle}>Conteo anterior</Text>
                {voteTally.map((item) => (
                  <Text key={item.playerId} style={styles.listText}>
                    {item.name}: {item.votes} voto{item.votes === 1 ? '' : 's'}
                  </Text>
                ))}
              </View>
            )}
            {voteCandidates.map((player) => {
              return (
                <Pressable
                  key={player.id}
                  style={[
                    styles.voteButton,
                    selectedVoteId === player.id && styles.voteButtonSelected,
                  ]}
                  onPress={() => setSelectedVoteId(player.id)}
                >
                  <Text style={styles.voteButtonText}>{player.name}</Text>
                </Pressable>
              );
            })}
            <Pressable
              style={[styles.primaryButton, !selectedVoteId && styles.disabledButton]}
              disabled={!selectedVoteId}
              onPress={submitVote}
            >
              <Text style={styles.primaryButtonText}>Registrar voto</Text>
            </Pressable>
          </View>
        )}

        {phase === 'eliminated' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {eliminatedPlayerName} fue eliminado
            </Text>
            <Text style={styles.bodyText}>
              No era el impostor. El juego continua.
            </Text>
            <Text style={styles.bodyText}>
              Quedan {activePlayers.length - 1} jugadores en la partida.
            </Text>
            <Text style={styles.helperText}>
              La palabra no se vuelve a mostrar. Los jugadores deben recordarla.
            </Text>
            {voteTally.length > 0 && (
              <View style={styles.listCard}>
                <Text style={styles.listTitle}>Resultado de la votacion</Text>
                {voteTally.map((item) => (
                  <Text key={item.playerId} style={styles.listText}>
                    {item.name}: {item.votes} voto{item.votes === 1 ? '' : 's'}
                  </Text>
                ))}
              </View>
            )}
            <View style={styles.listCard}>
              <Text style={styles.listTitle}>Siguen jugando</Text>
              <Text style={styles.listText}>
                {visibleActivePlayers.map((player) => player.name).join(', ')}
              </Text>
            </View>
            <View style={styles.listCardMuted}>
              <Text style={styles.listTitle}>Eliminados</Text>
              <Text style={styles.listText}>
                {visibleEliminatedPlayers.map((player) => player.name).join(', ')}
              </Text>
            </View>
            <Pressable style={styles.primaryButton} onPress={nextRound}>
              <Text style={styles.primaryButtonText}>
                Siguiente ronda
              </Text>
            </Pressable>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {gameResult === 'innocents'
                ? 'El grupo gano la partida'
                : 'El impostor gano la partida'}
            </Text>
            <Text style={styles.bodyText}>
              Impostor: {impostorPlayer?.name}
            </Text>
            {selectedVoteId ? (
              <Text style={styles.bodyText}>
                Ultimo eliminado: {selectedPlayer?.name}
              </Text>
            ) : null}
            {voteTally.length > 0 && (
              <View style={styles.listCard}>
                <Text style={styles.listTitle}>Resultado de la votacion</Text>
                {voteTally.map((item) => (
                  <Text key={item.playerId} style={styles.listText}>
                    {item.name}: {item.votes} voto{item.votes === 1 ? '' : 's'}
                  </Text>
                ))}
              </View>
            )}
            {visibleEliminatedPlayers.length > 0 && (
              <View style={styles.listCardMuted}>
                <Text style={styles.listTitle}>Eliminados</Text>
                <Text style={styles.listText}>
                  {visibleEliminatedPlayers.map((player) => player.name).join(', ')}
                </Text>
              </View>
            )}
            <Text style={styles.bodyText}>
              Historia: {round?.word}
            </Text>
            {gameResult === 'impostor' && (
              <Text style={styles.bodyText}>
                El impostor sobrevivio {settings.maxRounds} rondas sin ser
                descubierto.
              </Text>
            )}
            <Pressable style={styles.primaryButton} onPress={startGame}>
              <Text style={styles.primaryButtonText}>Nueva partida</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={resetGame}>
              <Text style={styles.secondaryButtonText}>
                Volver a jugadores
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 64,
  },
  hero: {
    marginBottom: 24,
  },
  kicker: {
    color: '#64B5F6',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 46,
    marginTop: 10,
  },
  subtitle: {
    color: '#90A4AE',
    fontSize: 17,
    lineHeight: 24,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#1B2838',
    borderColor: '#2C3E50',
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  playerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0F1D2E',
    borderColor: '#2C3E50',
    borderRadius: 16,
    borderWidth: 1,
    color: '#FFFFFF',
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1565C0',
    borderRadius: 18,
    marginTop: 16,
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#1565C0',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 8,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#64B5F6',
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.45,
  },
  smallButton: {
    alignItems: 'center',
    backgroundColor: '#EF5350',
    borderRadius: 14,
    justifyContent: 'center',
    minWidth: 44,
    paddingHorizontal: 12,
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  helperText: {
    color: '#90A4AE',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 16,
  },
  warningText: {
    color: '#EF9A9A',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: '#0F1D2E',
    borderRadius: 24,
    justifyContent: 'center',
    minHeight: 220,
    padding: 20,
  },
  roleLabel: {
    color: '#90A4AE',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  wordText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  impostorText: {
    color: '#EF5350',
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
  },
  hiddenText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  roleHint: {
    color: '#B0BEC5',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 16,
    textAlign: 'center',
  },
  phraseCard: {
    backgroundColor: '#1A3A5C',
    borderRadius: 16,
    marginTop: 20,
    padding: 16,
    width: '100%',
  },
  phraseLabel: {
    color: '#64B5F6',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  phraseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 26,
    textAlign: 'center',
  },
  ruleText: {
    color: '#CFD8DC',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  timerText: {
    color: '#64B5F6',
    fontSize: 54,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  bodyText: {
    color: '#B0BEC5',
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 10,
  },
  listCard: {
    backgroundColor: '#0F1D2E',
    borderColor: '#2C3E50',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  listCardMuted: {
    backgroundColor: '#172230',
    borderColor: '#2C3E50',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  listTitle: {
    color: '#64B5F6',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  listText: {
    color: '#CFD8DC',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  voteButton: {
    backgroundColor: '#0F1D2E',
    borderColor: '#2C3E50',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    padding: 15,
  },
  voteButtonSelected: {
    backgroundColor: '#1A3A5C',
    borderColor: '#1565C0',
  },
  voteButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  settingLabel: {
    color: '#CFD8DC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  roundBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1565C0',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  roundBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
