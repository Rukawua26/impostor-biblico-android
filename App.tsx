import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { defaultPlayers } from './src/data/defaultPlayers';
import { createRound, normalizePlayers } from './src/game/createRound';
import type { GameSettings, Phase, Player, Round } from './src/types/game';

const defaultSettings: GameSettings = {
  discussionSeconds: 90,
  voteSeconds: 30,
};

export default function App() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [players, setPlayers] = useState<Player[]>(defaultPlayers);
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [round, setRound] = useState<Round | null>(null);
  const [revealIndex, setRevealIndex] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);
  const [selectedVoteId, setSelectedVoteId] = useState<number | null>(null);
  const [discussionTimeLeft, setDiscussionTimeLeft] = useState(defaultSettings.discussionSeconds);
  const [voteTimeLeft, setVoteTimeLeft] = useState(defaultSettings.voteSeconds);
  const [setupMessage, setSetupMessage] = useState('');

  const currentPlayer = players[revealIndex];
  const selectedPlayer = players.find((player) => player.id === selectedVoteId);
  const impostorPlayer = players.find((player) => player.id === round?.impostorId);
  const normalizedPlayers = useMemo(() => normalizePlayers(players), [players]);
  const canStart = normalizedPlayers.length >= 3;

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
    if (phase === 'setup') return 'Configura jugadores y empieza la ronda.';
    if (phase === 'rules') return 'Lee las reglas antes de pasar el telefono.';
    if (phase === 'reveal') return 'Pasa el telefono para ver roles en secreto.';
    if (phase === 'discussion') return 'Hablen sin revelar la palabra directamente.';
    if (phase === 'vote') return 'El grupo decide quien parece el impostor.';
    return 'Resultado de la ronda.';
  }, [phase]);

  function updatePlayerName(id: number, name: string) {
    setPlayers((current) =>
      current.map((player) => (player.id === id ? { ...player, name } : player)),
    );
    setSetupMessage('');
  }

  function addPlayer() {
    setPlayers((current) => [
      ...current,
      { id: Date.now(), name: `Jugador ${current.length + 1}` },
    ]);
  }

  function removePlayer(id: number) {
    setPlayers((current) => current.filter((player) => player.id !== id));
    setSetupMessage('');
  }

  function updateSetting(key: keyof GameSettings, value: number) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function startRound() {
    const activePlayers = normalizePlayers(players);

    if (activePlayers.length < 3) {
      setSetupMessage('Necesitas al menos 3 jugadores con nombres distintos.');
      return;
    }

    setPlayers(activePlayers);
    setRound(createRound(activePlayers));
    setRevealIndex(0);
    setCardVisible(false);
    setSelectedVoteId(null);
    setDiscussionTimeLeft(settings.discussionSeconds);
    setVoteTimeLeft(settings.voteSeconds);
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

    if (revealIndex === players.length - 1) {
      setPhase('discussion');
      setCardVisible(false);
      setDiscussionTimeLeft(settings.discussionSeconds);
      return;
    }

    setRevealIndex((current) => current + 1);
    setCardVisible(false);
  }

  function resetGame() {
    setPhase('setup');
    setRevealIndex(0);
    setCardVisible(false);
    setSelectedVoteId(null);
    setRound(null);
    setSetupMessage('');
  }

  function goToVote() {
    setVoteTimeLeft(settings.voteSeconds);
    setSelectedVoteId(null);
    setPhase('vote');
  }

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Juego presencial</Text>
          <Text style={styles.title}>El Impostor Biblico</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {phase === 'setup' && (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Jugadores</Text>
              <Text style={styles.helperText}>Minimo 3 jugadores. Los nombres repetidos se ignoraran.</Text>
              {players.map((player, index) => (
                <View key={player.id} style={styles.playerRow}>
                  <TextInput
                    style={styles.input}
                    value={player.name}
                    placeholder={`Jugador ${index + 1}`}
                    placeholderTextColor="#8F7A62"
                    returnKeyType="done"
                    onChangeText={(name) => updatePlayerName(player.id, name)}
                  />
                  {players.length > 3 && (
                    <Pressable style={styles.smallButton} onPress={() => removePlayer(player.id)}>
                      <Text style={styles.smallButtonText}>Quitar</Text>
                    </Pressable>
                  )}
                </View>
              ))}
              <Pressable style={styles.secondaryButton} onPress={addPlayer}>
                <Text style={styles.secondaryButtonText}>Agregar jugador</Text>
              </Pressable>
              {setupMessage ? <Text style={styles.warningText}>{setupMessage}</Text> : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Tiempos</Text>
              <Text style={styles.helperText}>Puedes ajustar los tiempos antes de iniciar.</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Discusion</Text>
                <View style={styles.settingButtons}>
                  {[60, 90, 120].map((seconds) => (
                    <Pressable
                      key={seconds}
                      style={[
                        styles.optionButton,
                        settings.discussionSeconds === seconds && styles.optionButtonSelected,
                      ]}
                      onPress={() => updateSetting('discussionSeconds', seconds)}
                    >
                      <Text style={styles.optionButtonText}>{seconds}s</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Votacion</Text>
                <View style={styles.settingButtons}>
                  {[20, 30, 45].map((seconds) => (
                    <Pressable
                      key={seconds}
                      style={[
                        styles.optionButton,
                        settings.voteSeconds === seconds && styles.optionButtonSelected,
                      ]}
                      onPress={() => updateSetting('voteSeconds', seconds)}
                    >
                      <Text style={styles.optionButtonText}>{seconds}s</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <Pressable
                style={[styles.primaryButton, !canStart && styles.disabledButton]}
                disabled={!canStart}
                onPress={startRound}
              >
                <Text style={styles.primaryButtonText}>Iniciar ronda</Text>
              </Pressable>
            </View>
          </>
        )}

        {phase === 'rules' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Reglas rapidas</Text>
            <Text style={styles.ruleText}>1. Un jugador sera impostor y no vera la historia.</Text>
            <Text style={styles.ruleText}>2. Los demas veran la misma historia biblica.</Text>
            <Text style={styles.ruleText}>3. Cada jugador da pistas sin decir la frase exacta.</Text>
            <Text style={styles.ruleText}>4. Al final todos votan por quien parece impostor.</Text>
            <Text style={styles.ruleText}>5. Si votan al impostor, gana el grupo; si no, gana el impostor.</Text>
            <Pressable style={styles.primaryButton} onPress={beginReveal}>
              <Text style={styles.primaryButtonText}>Entendido, revelar roles</Text>
            </Pressable>
          </View>
        )}

        {phase === 'reveal' && currentPlayer && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Turno de {currentPlayer.name}</Text>
            <Text style={styles.helperText}>Pasa el telefono. Solo esta persona debe mirar la siguiente pantalla.</Text>
            <View style={styles.roleCard}>
              {cardVisible ? (
                currentPlayer.id === round?.impostorId ? (
                  <>
                    <Text style={styles.roleLabel}>Tu rol</Text>
                    <Text style={styles.impostorText}>Impostor</Text>
                    <Text style={styles.roleHint}>Descubre la historia escuchando a los demas.</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.roleLabel}>Historia biblica</Text>
                    <Text style={styles.wordText}>{round?.word}</Text>
                    <Text style={styles.roleHint}>Da pistas sin decir la frase exacta.</Text>
                  </>
                )
              ) : (
                <>
                  <Text style={styles.roleLabel}>Pantalla oculta</Text>
                  <Text style={styles.hiddenText}>Solo {currentPlayer.name} debe mirar.</Text>
                </>
              )}
            </View>
            <Pressable style={styles.primaryButton} onPress={continueReveal}>
              <Text style={styles.primaryButtonText}>{cardVisible ? 'Ocultar y pasar' : 'Ver mi rol'}</Text>
            </Pressable>
          </View>
        )}

        {phase === 'discussion' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Discusion</Text>
            <Text style={styles.timerText}>{formatTime(discussionTimeLeft)}</Text>
            <Text style={styles.bodyText}>
              Cada jugador da una pista breve. El impostor debe fingir que conoce la historia.
            </Text>
            <Text style={styles.helperText}>Cuando el tiempo llegue a cero, pasen a votacion. Tambien puedes avanzar antes.</Text>
            <Pressable style={styles.primaryButton} onPress={goToVote}>
              <Text style={styles.primaryButtonText}>Ir a votacion</Text>
            </Pressable>
          </View>
        )}

        {phase === 'vote' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Votar impostor</Text>
            <Text style={styles.timerText}>{formatTime(voteTimeLeft)}</Text>
            <Text style={styles.helperText}>Elige al jugador con mas votos del grupo.</Text>
            {players.map((player) => (
              <Pressable
                key={player.id}
                style={[styles.voteButton, selectedVoteId === player.id && styles.voteButtonSelected]}
                onPress={() => setSelectedVoteId(player.id)}
              >
                <Text style={styles.voteButtonText}>{player.name}</Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.primaryButton, !selectedVoteId && styles.disabledButton]}
              disabled={!selectedVoteId}
              onPress={() => setPhase('result')}
            >
              <Text style={styles.primaryButtonText}>Revelar resultado</Text>
            </Pressable>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {selectedVoteId === round?.impostorId ? 'El grupo acerto' : 'El impostor escapo'}
            </Text>
            <Text style={styles.bodyText}>Impostor: {impostorPlayer?.name}</Text>
            <Text style={styles.bodyText}>Votaron por: {selectedPlayer?.name}</Text>
            <Text style={styles.bodyText}>Historia: {round?.word}</Text>
            <Pressable style={styles.primaryButton} onPress={startRound}>
              <Text style={styles.primaryButtonText}>Nueva ronda</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={resetGame}>
              <Text style={styles.secondaryButtonText}>Editar jugadores</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#120B06',
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
    color: '#E8B45D',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFF4E2',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 46,
    marginTop: 10,
  },
  subtitle: {
    color: '#CBB89F',
    fontSize: 17,
    lineHeight: 24,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#21150C',
    borderColor: '#3D2918',
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    color: '#FFF4E2',
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
    backgroundColor: '#150D08',
    borderColor: '#49301B',
    borderRadius: 16,
    borderWidth: 1,
    color: '#FFF4E2',
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  helperText: {
    color: '#B7A185',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 16,
  },
  warningText: {
    color: '#FFB199',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#E8B45D',
    borderRadius: 18,
    marginTop: 16,
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: '#1B1208',
    fontSize: 17,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#6C4D2D',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 8,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#F2C981',
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.45,
  },
  smallButton: {
    alignItems: 'center',
    borderColor: '#6C4D2D',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  smallButtonText: {
    color: '#F2C981',
    fontWeight: '800',
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: '#150D08',
    borderRadius: 24,
    justifyContent: 'center',
    minHeight: 220,
    padding: 20,
  },
  roleLabel: {
    color: '#A79073',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  wordText: {
    color: '#FFF4E2',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  impostorText: {
    color: '#FF705D',
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
  },
  hiddenText: {
    color: '#FFF4E2',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  roleHint: {
    color: '#CBB89F',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 16,
    textAlign: 'center',
  },
  ruleText: {
    color: '#D9C7AD',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  timerText: {
    color: '#E8B45D',
    fontSize: 54,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  bodyText: {
    color: '#D9C7AD',
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 10,
  },
  voteButton: {
    backgroundColor: '#150D08',
    borderColor: '#49301B',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    padding: 15,
  },
  voteButtonSelected: {
    backgroundColor: '#4B321D',
    borderColor: '#E8B45D',
  },
  voteButtonText: {
    color: '#FFF4E2',
    fontSize: 17,
    fontWeight: '800',
  },
  settingRow: {
    marginBottom: 18,
  },
  settingLabel: {
    color: '#FFF4E2',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  settingButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#150D08',
    borderColor: '#49301B',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  optionButtonSelected: {
    backgroundColor: '#4B321D',
    borderColor: '#E8B45D',
  },
  optionButtonText: {
    color: '#FFF4E2',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
});
