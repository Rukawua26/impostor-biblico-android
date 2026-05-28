import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameSettings, Player } from '../types/game';

type VoteScreenProps = {
  activePlayers: Player[];
  selectedVoteIds: number[];
  selectedPlayers: Player[];
  settings: GameSettings;
  voteTimeLeft: number;
  formatTime: (seconds: number) => string;
  onToggleVoteSelection: (playerId: number) => void;
  onConfirmVote: () => void;
  onNewGame: () => void;
  onEditGame: () => void;
};

export function VoteScreen({
  activePlayers,
  selectedVoteIds,
  selectedPlayers,
  settings,
  voteTimeLeft,
  formatTime,
  onToggleVoteSelection,
  onConfirmVote,
  onNewGame,
  onEditGame,
}: VoteScreenProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Votacion fisica</Text>
      <Text style={styles.timerText}>{formatTime(voteTimeLeft)}</Text>
      <Text style={styles.helperText}>
        Todos votan levantando la mano. El facilitador marca al jugador que el grupo decidio eliminar. Puedes
        escoger hasta {settings.impostorCount}.
      </Text>
      <Text style={styles.selectionCountText}>
        Seleccionados {selectedVoteIds.length} de {settings.impostorCount} posibles
      </Text>
      {activePlayers.map((player) => (
        <Pressable
          key={player.id}
          style={[styles.voteButton, selectedVoteIds.includes(player.id) && styles.voteButtonSelected]}
          onPress={() => onToggleVoteSelection(player.id)}
        >
          <Text style={styles.voteButtonText}>{player.name}</Text>
        </Pressable>
      ))}
      {selectedPlayers.length > 0 ? (
        <Text style={styles.warningText}>
          Confirmar: {selectedPlayers.map((player) => player.name).join(', ')}
        </Text>
      ) : null}
      <Pressable
        style={[styles.primaryButton, selectedVoteIds.length === 0 && styles.disabledButton]}
        disabled={selectedVoteIds.length === 0}
        onPress={onConfirmVote}
      >
        <Text style={styles.primaryButtonText}>
          {selectedVoteIds.length > 1 ? 'Confirmar eliminados' : 'Confirmar eliminado'}
        </Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={onNewGame}>
        <Text style={styles.secondaryButtonText}>Nueva partida</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={onEditGame}>
        <Text style={styles.secondaryButtonText}>Editar partida</Text>
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
  timerText: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  helperText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 16,
  },
  selectionCountText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  voteButton: {
    backgroundColor: '#B76288',
    borderColor: '#0B78B3',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    padding: 15,
  },
  voteButtonSelected: {
    backgroundColor: '#FF4406',
    borderColor: '#0B78B3',
  },
  voteButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  warningText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
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
  disabledButton: {
    opacity: 0.45,
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
