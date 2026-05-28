import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Player } from '../types/game';

type DiscussionScreenProps = {
  roundNumber: number;
  maxRounds: number;
  discussionTimeLeft: number;
  firstSpeaker: Player | undefined;
  firstSpeakerPulse: Animated.Value;
  visibleActivePlayers: Player[];
  visibleEliminatedPlayers: Player[];
  onGoToVote: () => void;
  formatTime: (seconds: number) => string;
};

export function DiscussionScreen({
  roundNumber,
  maxRounds,
  discussionTimeLeft,
  firstSpeaker,
  firstSpeakerPulse,
  visibleActivePlayers,
  visibleEliminatedPlayers,
  onGoToVote,
  formatTime,
}: DiscussionScreenProps) {
  return (
    <View style={styles.card}>
      <View style={styles.roundBadge}>
        <Text style={styles.roundBadgeText}>
          Ronda {roundNumber} de {maxRounds}
        </Text>
      </View>
      <Text style={styles.timerText}>{formatTime(discussionTimeLeft)}</Text>
      <Text style={styles.bodyText}>Cada jugador da una pista breve. Los impostores deben fingir.</Text>
      {firstSpeaker ? (
        <Animated.View
          style={[
            styles.firstSpeakerCard,
            {
              opacity: firstSpeakerPulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.88, 1],
              }),
              transform: [
                {
                  scale: firstSpeakerPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.035],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.firstSpeakerLabel}>Empieza</Text>
          <Text style={styles.firstSpeakerName}>{firstSpeaker.name}</Text>
          <Text style={styles.firstSpeakerHint}>Luego sigan en sentido horario.</Text>
        </Animated.View>
      ) : null}
      <Text style={styles.helperText}>
        Tiempo restante de discusion. Pueden avanzar antes si todos estan listos.
      </Text>
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Jugadores activos</Text>
        <Text style={styles.listText}>{visibleActivePlayers.map((player) => player.name).join(', ')}</Text>
      </View>
      {visibleEliminatedPlayers.length > 0 && (
        <View style={styles.listCard}>
          <Text style={styles.listTitle}>Eliminados</Text>
          <Text style={styles.listText}>
            {visibleEliminatedPlayers.map((player) => player.name).join(', ')}
          </Text>
        </View>
      )}
      <Pressable style={styles.primaryButton} onPress={onGoToVote}>
        <Text style={styles.primaryButtonText}>Ir a votacion</Text>
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
  timerText: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  bodyText: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 10,
  },
  firstSpeakerCard: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#B76288',
    borderColor: '#FF4406',
    borderRadius: 26,
    borderWidth: 2,
    marginBottom: 16,
    minWidth: '68%',
    paddingHorizontal: 22,
    paddingVertical: 20,
    shadowColor: '#FF4406',
    shadowOpacity: 0.38,
    shadowRadius: 24,
  },
  firstSpeakerLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  firstSpeakerName: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
    textAlign: 'center',
  },
  firstSpeakerHint: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 10,
    textAlign: 'center',
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
  roundBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF4406',
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
