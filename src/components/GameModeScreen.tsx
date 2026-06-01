import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';

interface Props {
  onSelectPresencial: () => void;
  onSelectOnline: () => void;
}

export function GameModeScreen({ onSelectPresencial, onSelectOnline }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.onSurface }]}>El Impostor Biblico</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Elige el modo de juego</Text>
        <View style={[styles.divider, { backgroundColor: colors.primary }]} />
        <View style={styles.buttons}>
          <Button title="Jugar presencial" onPress={onSelectPresencial} variant="primary" />
          <View style={{ height: 16 }} />
          <Button title="Jugar en linea" onPress={onSelectOnline} variant="secondary" />
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
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  divider: {
    height: 3,
    borderRadius: 999,
    width: 60,
    marginTop: 16,
    marginBottom: 40,
  },
  buttons: {
    width: '100%',
  },
});
