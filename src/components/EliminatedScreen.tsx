import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Player } from '../types/game';

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
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        {eliminatedPlayerName} {isPluralEliminated ? 'fueron eliminados' : 'fue eliminado'}
      </Text>
      <Text
        style={
          selectedWasOnlyImpostors
            ? styles.successMessageText
            : selectedHadNoImpostors
              ? styles.dangerMessageText
              : styles.mixedMessageText
        }
      >
        {selectedWasOnlyImpostors
          ? 'Buena votacion: solo eliminaron impostores, pero todavia queda alguno.'
          : selectedHadNoImpostors
            ? 'No eliminaron ningun impostor. El juego continua.'
            : 'Votacion mezclada: eliminaron impostor e inocente.'}
      </Text>
      <Text style={styles.bodyText}>
        Quedan {activePlayers.length - selectedVoteIds.length} jugadores en la partida.
      </Text>
      <Text style={styles.helperText}>
        La palabra no se vuelve a mostrar. Los jugadores deben recordarla.
      </Text>
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Siguen jugando</Text>
        <Text style={styles.listText}>{visibleActivePlayers.map((player) => player.name).join(', ')}</Text>
      </View>
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Eliminados</Text>
        <Text style={styles.listText}>
          {visibleEliminatedPlayers.map((player) => player.name).join(', ')}
        </Text>
      </View>
      <Pressable style={styles.primaryButton} onPress={onNextRound}>
        <Text style={styles.primaryButtonText}>Siguiente ronda</Text>
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
  successMessageText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 12,
  },
  dangerMessageText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 12,
  },
  mixedMessageText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 12,
  },
  bodyText: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 10,
  },
  helperText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 16,
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
    color: '#FFFFFF',
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
});
