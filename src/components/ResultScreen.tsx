import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameResult, GameSettings, Player, Round } from '../types/game';

type ResultScreenProps = {
  gameResult: GameResult;
  impostorPlayers: Player[];
  selectedPlayers: Player[];
  visibleEliminatedPlayers: Player[];
  round: Round | null;
  settings: GameSettings;
  selectedVoteIds: number[];
  onNewGame: () => void;
  onEditGame: () => void;
};

export function ResultScreen({
  gameResult,
  impostorPlayers,
  selectedPlayers,
  visibleEliminatedPlayers,
  round,
  settings,
  selectedVoteIds,
  onNewGame,
  onEditGame,
}: ResultScreenProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        {gameResult === 'innocents' ? 'El grupo gano la partida' : 'Los impostores ganaron la partida'}
      </Text>
      <Text style={styles.bodyText}>
        Impostores: {impostorPlayers.map((player) => player.name).join(', ')}
      </Text>
      {selectedVoteIds.length > 0 ? (
        <Text style={styles.bodyText}>
          Ultimos eliminados: {selectedPlayers.map((player) => player.name).join(', ')}
        </Text>
      ) : null}
      {visibleEliminatedPlayers.length > 0 && (
        <View style={styles.listCard}>
          <Text style={styles.listTitle}>Eliminados</Text>
          <Text style={styles.listText}>
            {visibleEliminatedPlayers.map((player) => player.name).join(', ')}
          </Text>
        </View>
      )}
      <Text style={styles.bodyText}>Historia: {round?.word}</Text>
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Pistas usadas</Text>
        <Text style={styles.listText}>
          {[...new Set(Object.values(round?.impostorCluesById ?? {}))].join(', ')}
        </Text>
      </View>
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Referencias biblicas</Text>
        <Text style={styles.listText}>{round?.impostorReference}</Text>
      </View>
      {gameResult === 'impostor' && (
        <Text style={styles.bodyText}>
          Al menos un impostor sobrevivio {settings.maxRounds} rondas sin ser descubierto.
        </Text>
      )}
      <Pressable style={styles.primaryButton} onPress={onNewGame}>
        <Text style={styles.primaryButtonText}>Nueva partida</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={onEditGame}>
        <Text style={styles.secondaryButtonText}>Volver a jugadores</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#B76288',
    borderColor: '#0B78B3',
    borderRadius: 32,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  bodyText: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 10,
  },
  listCard: {
    backgroundColor: '#B76288',
    borderColor: '#0B78B3',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  listTitle: {
    color: '#0B78B3',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  listText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#FF4406',
    borderRadius: 20,
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
    backgroundColor: '#B76288',
    borderColor: '#0B78B3',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#0B78B3',
    fontSize: 16,
    fontWeight: '800',
  },
});
