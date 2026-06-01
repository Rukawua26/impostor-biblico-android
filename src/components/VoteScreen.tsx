import { StyleSheet, Text, View } from 'react-native';
import { Button } from './ui/Button';
import type { GameSettings, Player } from '../types/game';
import { useTheme } from '../context/ThemeContext';

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
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.secondaryContainer, borderColor: colors.outline }]}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Votacion fisica</Text>
      <Text style={[styles.timerText, { color: colors.onSurface }]}>{formatTime(voteTimeLeft)}</Text>
      <Text style={[styles.helperText, { color: colors.onSurfaceVariant }]}>
        Todos votan levantando la mano. El facilitador marca al jugador que el grupo decidio eliminar. Puedes
        escoger hasta {settings.impostorCount}.
      </Text>
      <Text style={[styles.selectionCountText, { color: colors.onSurfaceVariant }]}>
        Seleccionados {selectedVoteIds.length} de {settings.impostorCount} posibles
      </Text>
      {activePlayers.map((player) => (
        <View key={player.id} style={styles.voteButtonContainer}>
          <Button
            title={player.name}
            onPress={() => onToggleVoteSelection(player.id)}
            variant={selectedVoteIds.includes(player.id) ? 'secondary' : 'outline'}
            size="medium"
          />
        </View>
      ))}
      {selectedPlayers.length > 0 ? (
        <Text style={[styles.warningText, { color: colors.error }]}>
          Confirmar: {selectedPlayers.map((player) => player.name).join(', ')}
        </Text>
      ) : null}
      <Button
        title={selectedVoteIds.length > 1 ? 'Confirmar eliminados' : 'Confirmar eliminado'}
        onPress={onConfirmVote}
        variant="primary"
        disabled={selectedVoteIds.length === 0}
      />
      <View style={styles.buttonRow}>
        <Button title="Nueva partida" onPress={onNewGame} variant="outline" />
        <Button title="Editar partida" onPress={onEditGame} variant="outline" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  timerText: {
    fontSize: 54,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 16,
  },
  selectionCountText: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  voteButtonContainer: {
    marginBottom: 10,
  },
  warningText: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
