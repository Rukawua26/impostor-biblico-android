import { StyleSheet, Text, View } from 'react-native';
import { Button } from './ui/Button';
import type { Player } from '../types/game';
import { useTheme } from '../context/ThemeContext';

type EliminatedScreenProps = {
  eliminatedPlayerName: string;
  isPluralEliminated: boolean;
  selectedWasOnlyImpostors: boolean;
  selectedHadNoImpostors: boolean;
  activePlayers: Player[];
  selectedVoteIds: number[];
  visibleActivePlayers: Player[];
  visibleEliminatedPlayers: Player[];
  onNextRound: () => void;
};

export function EliminatedScreen({
  eliminatedPlayerName,
  isPluralEliminated,
  selectedWasOnlyImpostors,
  selectedHadNoImpostors,
  activePlayers,
  selectedVoteIds,
  visibleActivePlayers,
  visibleEliminatedPlayers,
  onNextRound,
}: EliminatedScreenProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.secondaryContainer, borderColor: colors.outline }]}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
        {eliminatedPlayerName} {isPluralEliminated ? 'fueron eliminados' : 'fue eliminado'}
      </Text>
      <Text
        style={[
          selectedWasOnlyImpostors
            ? styles.successMessageText
            : selectedHadNoImpostors
              ? styles.dangerMessageText
              : styles.mixedMessageText,
          { color: colors.onSurface },
        ]}
      >
        {selectedWasOnlyImpostors
          ? 'Buena votacion: solo eliminaron impostores, pero todavia queda alguno.'
          : selectedHadNoImpostors
            ? 'No eliminaron ningun impostor. El juego continua.'
            : 'Votacion mezclada: eliminaron impostor e inocente.'}
      </Text>
      <Text style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
        Quedan {activePlayers.length - selectedVoteIds.length} jugadores en la partida.
      </Text>
      <Text style={[styles.helperText, { color: colors.onSurfaceVariant }]}>
        La palabra no se vuelve a mostrar. Los jugadores deben recordarla.
      </Text>
      <View
        style={[styles.listCard, { backgroundColor: colors.secondaryContainer, borderColor: colors.outline }]}
      >
        <Text style={[styles.listTitle, { color: colors.primary }]}>Siguen jugando</Text>
        <Text style={[styles.listText, { color: colors.onSurface }]}>
          {visibleActivePlayers.map((player) => player.name).join(', ')}
        </Text>
      </View>
      <View
        style={[styles.listCard, { backgroundColor: colors.secondaryContainer, borderColor: colors.outline }]}
      >
        <Text style={[styles.listTitle, { color: colors.primary }]}>Eliminados</Text>
        <Text style={[styles.listText, { color: colors.onSurface }]}>
          {visibleEliminatedPlayers.map((player) => player.name).join(', ')}
        </Text>
      </View>
      <Button title="Siguiente ronda" onPress={onNextRound} variant="primary" />
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
  successMessageText: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 12,
  },
  dangerMessageText: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 12,
  },
  mixedMessageText: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 10,
  },
  helperText: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 16,
  },
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  listText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
});
