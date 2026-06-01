import { Animated, StyleSheet, Text, View } from 'react-native';
import { Button } from './ui/Button';
import type { Player } from '../types/game';
import { useTheme } from '../context/ThemeContext';

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
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.secondaryContainer }]}>
      <View style={[styles.roundBadge, { backgroundColor: colors.primary }]}>
        <Text style={[styles.roundBadgeText, { color: colors.onPrimary }]}>
          Ronda {roundNumber} de {maxRounds}
        </Text>
      </View>
      <Text style={[styles.timerText, { color: colors.onSurface }]}>{formatTime(discussionTimeLeft)}</Text>
      <Text style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
        Cada jugador da una pista breve. Los impostores deben fingir.
      </Text>
      {firstSpeaker ? (
        <Animated.View
          style={[
            styles.firstSpeakerCard,
            {
              backgroundColor: colors.primary,
              borderColor: colors.tertiary,
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
          <Text style={[styles.firstSpeakerLabel, { color: colors.onPrimary }]}>Empieza</Text>
          <Text style={[styles.firstSpeakerName, { color: colors.onPrimary }]}>{firstSpeaker.name}</Text>
          <Text style={[styles.firstSpeakerHint, { color: colors.onPrimary }]}>
            Luego sigan en sentido horario.
          </Text>
        </Animated.View>
      ) : null}
      <Text style={[styles.helperText, { color: colors.onSurfaceVariant }]}>
        Tiempo restante de discusion. Pueden avanzar antes si todos estan listos.
      </Text>
      <View style={[styles.listCard, { backgroundColor: colors.secondaryContainer }]}>
        <Text style={[styles.listTitle, { color: colors.primary }]}>Jugadores activos</Text>
        <Text style={[styles.listText, { color: colors.onSurface }]}>
          {visibleActivePlayers.map((player) => player.name).join(', ')}
        </Text>
      </View>
      {visibleEliminatedPlayers.length > 0 && (
        <View style={[styles.listCard, { backgroundColor: colors.secondaryContainer }]}>
          <Text style={[styles.listTitle, { color: colors.primary }]}>Eliminados</Text>
          <Text style={[styles.listText, { color: colors.onSurface }]}>
            {visibleEliminatedPlayers.map((player) => player.name).join(', ')}
          </Text>
        </View>
      )}
      <Button title="Ir a votacion" onPress={onGoToVote} variant="primary" />
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
  timerText: {
    fontSize: 54,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 10,
  },
  firstSpeakerCard: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 26,
    borderWidth: 2,
    marginBottom: 16,
    minWidth: '68%',
    paddingHorizontal: 22,
    paddingVertical: 20,
    shadowOpacity: 0.38,
    shadowRadius: 24,
  },
  firstSpeakerLabel: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  firstSpeakerName: {
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
    textAlign: 'center',
  },
  firstSpeakerHint: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 10,
    textAlign: 'center',
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
  primaryButton: {
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 16,
    paddingVertical: 15,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '900',
  },
  roundBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  roundBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
