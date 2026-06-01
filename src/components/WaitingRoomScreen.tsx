import { StyleSheet, Text, View } from 'react-native';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';

interface Props {
  onBack: () => void;
}

export function WaitingRoomScreen({ onBack }: Props) {
  const { colors } = useTheme();
  const { roomCode, players, isHost, startGame } = useSocket();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Sala de espera</Text>

        <View style={[styles.codeBox, { backgroundColor: colors.surfaceContainer }]}>
          <Text style={[styles.codeLabel, { color: colors.onSurfaceVariant }]}>Codigo de sala</Text>
          <Text style={[styles.code, { color: colors.primary }]}>{roomCode}</Text>
          <Text style={[styles.codeHint, { color: colors.onSurfaceVariant }]}>
            Comparte este codigo con otros jugadores
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Jugadores ({players.length})</Text>

        <View style={[styles.playerList, { borderColor: colors.outline }]}>
          {players.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>Esperando jugadores...</Text>
          )}
          {players.map((player) => (
            <View key={player.id} style={styles.playerRow}>
              <Text style={[styles.playerName, { color: colors.onSurface }]}>{player.name}</Text>
              {player.isHost && <Text style={[styles.hostBadge, { color: colors.primary }]}>Anfitrion</Text>}
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          {isHost && (
            <Button
              title="Iniciar partida"
              onPress={startGame}
              variant="primary"
              disabled={players.length < 3}
            />
          )}
          {!isHost && (
            <Text style={[styles.waitingText, { color: colors.onSurfaceVariant }]}>
              Esperando a que el anfitrion inicie la partida...
            </Text>
          )}
          <View style={{ height: 12 }} />
          <Button title="Salir de la sala" onPress={onBack} variant="outline" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
  },
  codeBox: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 28,
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  code: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  codeHint: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  playerList: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 28,
    minHeight: 80,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  hostBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  buttons: {
    width: '100%',
  },
  waitingText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
