import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './ui/Button';
import type { GameResult, GameSettings, Player, Round } from '../types/game';
import { useTheme } from '../context/ThemeContext';
import { getJwBibleUrl } from '../utils/jwBibleUrl';

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
  const { colors } = useTheme();
  const jwBibleUrl = getJwBibleUrl(round?.impostorReference);

  function openBibleReference() {
    if (!jwBibleUrl) return;
    Linking.openURL(jwBibleUrl);
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.secondaryContainer, borderColor: colors.outline }]}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
        {gameResult === 'innocents' ? 'El grupo gano la partida' : 'Los impostores ganaron la partida'}
      </Text>
      <Text style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
        Impostores: {impostorPlayers.map((player) => player.name).join(', ')}
      </Text>
      {selectedVoteIds.length > 0 ? (
        <Text style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
          Ultimos eliminados: {selectedPlayers.map((player) => player.name).join(', ')}
        </Text>
      ) : null}
      {visibleEliminatedPlayers.length > 0 && (
        <View
          style={[
            styles.listCard,
            { backgroundColor: colors.secondaryContainer, borderColor: colors.outline },
          ]}
        >
          <Text style={[styles.listTitle, { color: colors.primary }]}>Eliminados</Text>
          <Text style={[styles.listText, { color: colors.onSurface }]}>
            {visibleEliminatedPlayers.map((player) => player.name).join(', ')}
          </Text>
        </View>
      )}
      <Text style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>Historia: {round?.word}</Text>
      <View
        style={[styles.listCard, { backgroundColor: colors.secondaryContainer, borderColor: colors.outline }]}
      >
        <Text style={[styles.listTitle, { color: colors.primary }]}>Pistas usadas</Text>
        <Text style={[styles.listText, { color: colors.onSurface }]}>
          {[...new Set(Object.values(round?.impostorCluesById ?? {}))].join(', ')}
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.listCard,
          {
            backgroundColor: colors.secondaryContainer,
            borderColor: jwBibleUrl ? colors.primary : colors.outline,
            opacity: pressed && jwBibleUrl ? 0.75 : 1,
          },
        ]}
        disabled={!jwBibleUrl}
        onPress={openBibleReference}
      >
        <Text style={[styles.listTitle, { color: colors.primary }]}>Referencias biblicas</Text>
        <Text style={[styles.listText, jwBibleUrl && styles.linkText, { color: colors.onSurface }]}>
          {round?.impostorReference}
        </Text>
        {jwBibleUrl ? (
          <Text style={[styles.openHintText, { color: colors.primary }]}>Toca para leer en JW.org</Text>
        ) : null}
      </Pressable>
      {gameResult === 'impostor' && (
        <Text style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
          Al menos un impostor sobrevivio {settings.maxRounds} rondas sin ser descubierto.
        </Text>
      )}
      <View style={styles.buttonRow}>
        <Button title="Nueva partida" onPress={onNewGame} variant="primary" />
        <Button title="Volver a jugadores" onPress={onEditGame} variant="outline" />
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
  bodyText: {
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 10,
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
  linkText: {
    textDecorationLine: 'underline',
  },
  openHintText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
