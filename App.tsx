import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Phase = 'setup' | 'reveal' | 'discussion' | 'vote' | 'result';

type Player = {
  id: number;
  name: string;
};

const bibleDeck = [
  'David y Goliat',
  'El arca de Noé',
  'Jonás y el gran pez',
  'Daniel en el foso de los leones',
  'La torre de Babel',
  'Moisés y el mar rojo',
  'El buen samaritano',
  'La última cena',
];

const defaultPlayers: Player[] = [
  { id: 1, name: 'Jugador 1' },
  { id: 2, name: 'Jugador 2' },
  { id: 3, name: 'Jugador 3' },
  { id: 4, name: 'Jugador 4' },
];

function randomIndex(max: number) {
  return Math.floor(Math.random() * max);
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [players, setPlayers] = useState<Player[]>(defaultPlayers);
  const [roundWord, setRoundWord] = useState(bibleDeck[0]);
  const [impostorId, setImpostorId] = useState<number | null>(null);
  const [revealIndex, setRevealIndex] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);
  const [selectedVoteId, setSelectedVoteId] = useState<number | null>(null);

  const currentPlayer = players[revealIndex];
  const selectedPlayer = players.find((player) => player.id === selectedVoteId);
  const impostorPlayer = players.find((player) => player.id === impostorId);
  const canStart = players.filter((player) => player.name.trim()).length >= 3;

  const subtitle = useMemo(() => {
    if (phase === 'setup') return 'Configura jugadores y empieza la ronda.';
    if (phase === 'reveal') return 'Pasa el teléfono para ver roles en secreto.';
    if (phase === 'discussion') return 'Hablen sin revelar la palabra directamente.';
    if (phase === 'vote') return 'El grupo decide quién parece el impostor.';
    return 'Resultado de la ronda.';
  }, [phase]);

  function updatePlayerName(id: number, name: string) {
    setPlayers((current) =>
      current.map((player) => (player.id === id ? { ...player, name } : player)),
    );
  }

  function addPlayer() {
    setPlayers((current) => [
      ...current,
      { id: Date.now(), name: `Jugador ${current.length + 1}` },
    ]);
  }

  function removePlayer(id: number) {
    setPlayers((current) => current.filter((player) => player.id !== id));
  }

  function startRound() {
    const activePlayers = players
      .map((player) => ({ ...player, name: player.name.trim() }))
      .filter((player) => player.name);

    setPlayers(activePlayers);
    setRoundWord(bibleDeck[randomIndex(bibleDeck.length)]);
    setImpostorId(activePlayers[randomIndex(activePlayers.length)].id);
    setRevealIndex(0);
    setCardVisible(false);
    setSelectedVoteId(null);
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
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Juego presencial</Text>
          <Text style={styles.title}>El Impostor Bíblico</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {phase === 'setup' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Jugadores</Text>
            {players.map((player, index) => (
              <View key={player.id} style={styles.playerRow}>
                <TextInput
                  style={styles.input}
                  value={player.name}
                  placeholder={`Jugador ${index + 1}`}
                  placeholderTextColor="#8F7A62"
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
            <Pressable
              style={[styles.primaryButton, !canStart && styles.disabledButton]}
              disabled={!canStart}
              onPress={startRound}
            >
              <Text style={styles.primaryButtonText}>Iniciar ronda</Text>
            </Pressable>
          </View>
        )}

        {phase === 'reveal' && currentPlayer && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Turno de {currentPlayer.name}</Text>
            <View style={styles.roleCard}>
              {cardVisible ? (
                currentPlayer.id === impostorId ? (
                  <>
                    <Text style={styles.roleLabel}>Tu rol</Text>
                    <Text style={styles.impostorText}>Impostor</Text>
                    <Text style={styles.roleHint}>Descubre la historia escuchando a los demás.</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.roleLabel}>Historia bíblica</Text>
                    <Text style={styles.wordText}>{roundWord}</Text>
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
            <Text style={styles.sectionTitle}>Discusión</Text>
            <Text style={styles.bodyText}>
              Cada jugador da una pista breve. El impostor debe fingir que conoce la historia.
            </Text>
            <Pressable style={styles.primaryButton} onPress={() => setPhase('vote')}>
              <Text style={styles.primaryButtonText}>Ir a votación</Text>
            </Pressable>
          </View>
        )}

        {phase === 'vote' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Votar impostor</Text>
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
              {selectedVoteId === impostorId ? 'El pueblo acertó' : 'El impostor escapó'}
            </Text>
            <Text style={styles.bodyText}>Impostor: {impostorPlayer?.name}</Text>
            <Text style={styles.bodyText}>Votaron por: {selectedPlayer?.name}</Text>
            <Text style={styles.bodyText}>Historia: {roundWord}</Text>
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
});
